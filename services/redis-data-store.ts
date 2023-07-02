import bcrypt from "bcryptjs";
import redisClient from "../utils/redis";
import logger from "../utils/logger";
import { IUser } from "../types/user.type";

export const saveUserDataInRedis = async (data: IUser) => {
  const { firstName, lastName, username, email, password } = data;
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) {
        logger.error(err);
      }
      await redisClient.set(
        email,
        JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          password: hash,
        })
      );
    });
  });
};

export const getUserDataFromRedis = async (data: IUser) => {
  const { email, password } = data;
  const userData = await redisClient.get(email);
  if (userData) {
    const parsedUserData: IUser = JSON.parse(userData);
    bcrypt.compare(password, parsedUserData.password, function (err, res) {
      if (err) {
        logger.error(err);
        return null
      }
      return parsedUserData;
    });
  }

  return null;
};

export const checkIfKeyExistsInRedis = async (email: string) => {
  const userData = await redisClient.get(email);
  if (userData) {
    return true;
  }

  return false;
};
