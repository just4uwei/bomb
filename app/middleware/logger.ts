import { Context } from 'koa'
import { info as logger } from '../util/logger'

// 请求日志中间件
// 此中间件记录所有请求日志，注意，错误日志由 exception 中间件记录
export default async function(ctx: Context, next: () => Promise<any>) {
  const start = Date.now()
  const requestId = ctx.id
  console.log(`>> ${ctx.method}: ${ctx.url} [${requestId}]`)

  await next()
  const end = Date.now()
  const time = end - start
  const { req } = ctx
  const { headers, url, method } = req

  console.log(`<< ${ctx.method}: ${ctx.url} ${time}ms [${requestId}]`)

  logger.info('', {
    data: {
      requestId,
      time,
      code: ctx.status,
      method,
      url,
      headers
    }
  })
}
