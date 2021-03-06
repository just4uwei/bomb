import { Sequelize } from 'sequelize-typescript'
import Example from '../model/example'
import { genCondition } from '../util/model'
import raise from '../util/exception'
import EXCEPTION from '../config/constant/exception'
import { redis } from '../util/redis'

const { Op } = Sequelize

export default class {
  static async getList({ name, offset, limit }: { name?: string; offset?: number; limit?: number }) {
    const where = genCondition(
      {
        field: 'name',
        value: name,
        condition: {
          [Op.like]: `%${name}%`
        }
      },
      {
        field: '_delete',
        value: false
      }
    )

    const result = await Example.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']]
    })
    return result
  }

  static async createOne({ name }: { name: string }) {
    const item = await Example.create({
      name
    })
    return item
  }

  static async getOne(id: number) {
    const item = await Example.findByPk(id)
    if (!item) {
      return raise(EXCEPTION.ITEM_NOT_EXIST)
    }
    return item
  }

  static async updateOne(id: number, { name }: { name: string }) {
    const item = await this.getOne(id)
    item.name = name
    await item.save()
    return item
  }

  static async deleteOne(id: number) {
    const item = await this.getOne(id)
    item._delete = true
    await item.save()
    return item
  }

  static async transaction(index: number, flag: boolean) {
    await Example.sequelize.transaction(async t => {
      // 增加三条后再删除一条
      await Example.create({ name: `tom_${index}` })
      const item = await Example.create({ name: `tom_${index + 1}` })
      await Example.create({ name: `tom_${index + 2}` })
      await item.destroy()
      if (flag) {
        raise('transaction_test')
      }
    })
  }

  static async setAgeCache(age: number, expire: number = 60) {
    redis.set('age', age, 'EX', expire)
  }

  static async getAgeCache() {
    const data = await redis.get('age')
    return data
  }
}
