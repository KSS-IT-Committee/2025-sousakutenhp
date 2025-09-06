import { onRequestPost as __api_checkUser_ts_onRequestPost } from "C:\\Users\\shuji\\OneDrive\\デスクトップ\\小石川2025行事週間\\IT\\SOUSAKUTEN2025\\sousakuten2025hp\\functions\\api\\checkUser.ts"
import { onRequestPost as __api_vote_ts_onRequestPost } from "C:\\Users\\shuji\\OneDrive\\デスクトップ\\小石川2025行事週間\\IT\\SOUSAKUTEN2025\\sousakuten2025hp\\functions\\api\\vote.ts"
import { onRequest as ___middleware__cors_ts_onRequest } from "C:\\Users\\shuji\\OneDrive\\デスクトップ\\小石川2025行事週間\\IT\\SOUSAKUTEN2025\\sousakuten2025hp\\functions\\_middleware\\_cors.ts"

export const routes = [
    {
      routePath: "/api/checkUser",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_checkUser_ts_onRequestPost],
    },
  {
      routePath: "/api/vote",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_vote_ts_onRequestPost],
    },
  {
      routePath: "/_middleware/_cors",
      mountPath: "/_middleware",
      method: "",
      middlewares: [],
      modules: [___middleware__cors_ts_onRequest],
    },
  ]