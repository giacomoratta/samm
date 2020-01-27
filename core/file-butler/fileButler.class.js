const { _ } = require('../utils/lodash.extended')
const { parseOption } = require('./fileButler.utils')
const { FileButlerError } = require('./fileButlerError.class')
const Events = require('events')
const { fileUtils } = require('../utils/file.utils')

const ACCEPTED_EVENTS = ['save', 'load']

class FileButler {
  async set (options) {
    this.eventEmitter = new Events()
    this._hasData = false
    try {
      this.config = await parseOption(options)
    } catch (e) {
      throw e
    }
    this.data = this.config.defaultValue
  }

  empty () {
    return !this._hasData
  }

  get data () {
    return this.data
  }

  set data (data) {
    return this._setData(data)
  }

  _setData (data, doNotClone = false) {
    if (this.config.fn.validityCheck(data) !== true) {
      throw new FileButlerError(`This data is not valid as '${this.config.fileType}'.`)
    }
    this._hasData = !_.isNil(data)
    if (!this._hasData) this.data = this.config.defaultValue
    else this.data = (doNotClone === true ? data : _.cloneDeep(data))
    return this._hasData
  }

  async delete () {
    return fileUtils.removeFile(this.config.filePath)
  }

  async save () {
    let savedData = this.data
    if (this.config.saveFn) {
      // todo: if is promise...
      savedData = this.config.saveFn(this.data)
    }
    const saveResult = await this.config.fn.saveToFile(this.config.filePath, savedData) // todo: try/catch
    if (saveResult === true) {
      this.eventEmitter.emit('save', { filePath: this.config.filePath, data: savedData })
      if (this.config.backupTo) {
        try {
          await fileUtils.copyFile(this.config.filePath, this.config.backupTo)
        } catch (copyResult) {
          if (copyResult.err) {
            throw new FileButlerError(`Backup failed! From '${this.config.backupTo}' to ${this.config.backupTo}`)
          }
        }
      }
    }
    return saveResult
  }

  async load () {
    if (this.config.cloneFrom && !await fileUtils.fileExists(this.config.filePath)) {
      try {
        await fileUtils.copyFile(this.config.cloneFrom, this.config.filePath)
      } catch (copyResult) {
        if (copyResult.err) {
          throw new FileButlerError(`Cloning failed! From '${this.config.cloneFrom}' to ${this.config.filePath}`)
        }
      }
    }
    let loadedData = await this.config.fn.loadFromFile(this.config.filePath) // todo: try/catch
    if (this.config.loadFn) {
      // todo: if is promise...
      loadedData = this.config.loadFn(loadedData)
    }
    this._setData(loadedData, true)
    this.eventEmitter.emit('load', { filePath: this.config.filePath, data: this.get() })
    return this._hasData
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new FileButlerError(`Unrecognized event '${eventName}' for ${this.constructor.name}. Available events: ${ACCEPTED_EVENTS.join(',')}.`)
    }
    this.eventEmitter.on(eventName, cb)
  }
}

module.exports = {
  FileButler
}

// {"@version":1,"source_host":"ip-172-31-131-72.eu-west-1.compute.internal","message":"Unable to upload order [206998523] to s3 due to [null]","thread_name":"TaskExecutor-master-170922-ProcessTask [9349507351478]","@timestamp":"2020-01-27T08:56:42.999+01:00","level":"ERROR","logger_name":"de.hybris.platform.util.logging.HybrisLogger"}{"@version":1,"source_host":"ip-172-31-131-72.eu-west-1.compute.internal","message":"[SBP_2552][OrderModel][Values [sourcing=Sourcing [oaaProfileId=BRICO, execAllStrategies='', cart=DiymaxedaCartRequest{externalId=lM1ZwT0sSSaBpx4+A/RtlA==, orderId=null, shippingMethod=null, deliveryAddress=DeliveryAddress [city1=Drogenbos, city2=null, region=null, postCode1=1620, poBox=null, street=Paul Gilsonlaan, houseNum1=455B, country=BE], currencyIsoCode=EUR, totalPrice=189.0, deliveryCost=0.0, shippingMethod=null, items=CartItems [DiymaxedaCartItem{externalId=94cd59c13d2c492681a71e3e03f46d94-0, articleId=000000000005628118, quantity=1, unitIso=PCE, unit=ST, itemTotalPrice=189.0, currency=EUR, source=3319, sourcePreselected=X, shippingMethod=null}]}, reserve=X, Reservation=ReservationRequest [orderId=206998540, status=O, consumerId= BRICO, salesChannel= null]]]]","thread_name":"TaskExecutor-master-170923-ProcessTask [9349513118646]","@timestamp":"2020-01-27T08:56:43.002+01:00","level":"INFO","logger_name":"de.hybris.platform.util.logging.HybrisLogger"}
