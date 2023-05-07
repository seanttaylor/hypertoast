* Scaffold description of the `application/vnd.hypertoast` format
    * Include explanation of link relations structure and semantics
* Parameterize the status endpoint in `SmartRouter.getAppInstance` method so that clients define the status endpoint
* Extend the HyperToast application to support real-time notifications via HTTP callback
* Examine the `HTIterable` class's retry logic to ensure retries are appropriately spaced
* Investigate addition of dead letter queue for handling dropped toast requests
* Fix infinite request loop to HyperToast application instances when broker receives more requests than available instances
