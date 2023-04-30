/**
* An object having the StreamingDatasource API; a set of methods for managing streaming data
* @typedef {Object} DataPipeConfiguration
* @property {String|null} BOOTSTRAP_SERVER - the address of a Kafka bootstrap server
* @property {String|null} CLIENT_ID - the clientId of a Kafka application 
* @property {String|null} GROUP_ID - for a Kafka consumer
* @property {String|null} as - indicates whether a Kafka datasource will produce, consume or produce AND consume messages (defaults to both) valid values are: {producer|consumer}
*/

class DataPipe {
    config;

    /**
     * 
     * @param {Object} config 
     */
    constructor(config) {
        this.config = config;
    }   
    
    /**
     * Puts a new item onto a data source
     */
    put() {

    }

    /**
     * Starts consuming a data source (e.g. a queue, stream REST endpoint)
     */
    onPull() {
        
    }

    /**
     * Initializes the data pipe
     */
    open() {
        
    }
}

export default DataPipe;