require('./loadenv.js');

const { Long, ObjectId } = require('mongodb');
const { collections } = require('./mongodb.js');
const jose = require('jose');

module.exports = {defPermissionFunction};

let JWT_PUBKEY = undefined;

(async () => {
  JWT_PUBKEY = await jose.importSPKI(process.env.JWT_PUB_KEY, process.env.JWT_ALG);
})().catch((e) => {
  console.dir(e);
  console.error('Error importing JWT public key');
  process.exit(2);
});

function checkPermissionSpec(check, spec) {
  // noinspection JSBitwiseOperatorUsage (it's on purpose)
  return (check & spec) === spec;
}

function defPermissionFunction(permissions) {
  if (permissions instanceof Array) {
    for (const spec of permissions) {
      if (typeof spec !== 'bigint') {
        throw new Error("Invalid permission specification (should be bigint or array of bigints)");
      }
    }

    return (check) => {
      for (const spec of permissions) {
        if (checkPermissionSpec(check, spec)) {
          return true;
        }
      }

      return false;
    }
  } else if (typeof permissions === 'bigint') {
    return (check) => checkPermissionSpec(check, permissions);
  } else {
    throw new Error("Invalid permission specification (should be bigint or array of bigints)");
  }
}

const AUTH_GENERIC_ERROR = { error: 'You are not authorized to access this endpoint' };
const AUTH_GENERIC_ERROR_REFRESH = { error: 'You are not authorized to access this endpoint', refresh: true };
const AUTH_GENERIC_SERVER_ERROR = { error: 'Internal server error (auth)' };

module.exports.requireAuth = (permissions) => {
  let permCheckFun;
  if (typeof permissions === 'bigint' || permissions instanceof Array) {
    permCheckFun = defPermissionFunction(permissions);
  } else if (typeof permissions === 'function') {
    permCheckFun = permissions;
  } else if (typeof permissions === 'undefined') {
    permCheckFun = () => true;
  } else {
    throw new Error('Permissions should be a bigint, array, or a (perhaps async) function!');
  }

  return async (req, res, next) => {
    if (!JWT_PUBKEY) {
      res.status(503).json({ error: 'Authentication not yet configured! Please try again later.' });
      return;
    }

    const authorization = req.get('authorization');
    if (!authorization || typeof authorization !== 'string' || !authorization.startsWith("Bearer ")) {
      res.status(401).json(AUTH_GENERIC_ERROR);
      return;
    }

    // decode and verify the token
    let jwt;
    try {
      jwt = await jose.jwtVerify(authorization.substring("Bearer ".length), JWT_PUBKEY, {
        issuer: 'urn:stocktrack',
        audience: 'urn:stocktrack:be'
      });
    } catch (e) {
      res.status(401)

      if (e.code === 'ERR_JWT_EXPIRED') {
        res.json(AUTH_GENERIC_ERROR_REFRESH);
      } else {
        res.json(AUTH_GENERIC_ERROR);
      }

      return;
    }

    // check if the token is revoked
    let userId;
    try {
      userId = ObjectId.createFromBase64(jwt.payload.uid);
    } catch (e) {
      res.status(500).json(AUTH_GENERIC_SERVER_ERROR);
      return;
    }

    const user = await collections.user.findOne({_id: userId});

    if (user.tokenInvalidTime && user.tokenInvalidTime instanceof Date && user.tokenInvalidTime.getTime() >= jwt.payload.iat * 1000) {
      res.status(401).json(AUTH_GENERIC_ERROR_REFRESH);
      return;
    }

    // check permissions
    const permissions = Long.fromBytesBE(Buffer.from(jwt.payload.p, 'base64'), true).toBigInt();
    let checkRes = permCheckFun(permissions);
    if (checkRes instanceof Promise) {
      checkRes = await checkRes;
    }

    if (!checkRes) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    req.user = user;

    return next();
  };
}
