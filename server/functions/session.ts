import redis from "../redis";

const saveSession = async (sessionId: string, data: Record<string, any>) => {
  await redis.set(sessionId, JSON.stringify(data));
  await redis.expire(sessionId, 60 * 60 * 24 * 7); // 7 days
  return true;
};

const getSession = async (sessionId: string | null) => {
  if (!sessionId) return {};
  const session = await redis.get(sessionId) || "{}";
  return session ? JSON.parse(session) : {};
};

const deleteSession = async (sessionId: string) => {
  await redis.del(sessionId);
  return true;
};

const getAllSessions = async () => {
  const sessions = await redis.keys("*");
  const sessionData = await Promise.all(sessions.map((session) => redis.get(session)));
  return sessionData.map((session) => JSON.parse(session || "{}")); 
}

const clearAllSessions = async () => {
  const sessions = await redis.keys("*");
  await Promise.all(sessions.map((session) => redis.del(session)));
  return true; 
}

export { saveSession, getSession, deleteSession, getAllSessions, clearAllSessions };
