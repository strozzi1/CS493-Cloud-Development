const redis = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

const redisClient = redis.createClient(redisPort, redisHost);

const rateLimitWindowMS = 60000;
const rateLimitNumRequests = 5;

function getUserTokenBucket(ip) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(ip, (err, tokenBucket) => {
      if (err) {
        reject(err);
      } else {
        if (tokenBucket) {
          tokenBucket.tokens = parseFloat(tokenBucket.tokens);
        } else {
          tokenBucket = {
            tokens: rateLimitNumRequests,
            last: Date.now()
          };
        }
        resolve(tokenBucket);
      }
    });
  });
}

function saveUserTokenBucket(ip, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(ip, tokenBucket, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function applyRateLimit(req, res, next) {
  try {
    const tokenBucket = await getUserTokenBucket(req.ip);
    const timestamp = Date.now();
    const ellapsedMilliseconds = timestamp - tokenBucket.last;
    const newTokens = ellapsedMilliseconds *
      (rateLimitNumRequests / rateLimitWindowMS);
    tokenBucket.tokens += newTokens;
    tokenBucket.tokens = Math.min(
      tokenBucket.tokens,
      rateLimitNumRequests
    );
    tokenBucket.last = timestamp;

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      await saveUserTokenBucket(req.ip, tokenBucket);
      next();
    } else {
      await saveUserTokenBucket(req.ip, tokenBucket);
      res.status(429).send({
        error: "Too many requests per minute."
      });
    }
  } catch (err) {
    console.error(err);
    next();
  }
}
exports.applyRateLimit = applyRateLimit;
