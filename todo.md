* Scaffold description of the `application/vnd.hypertoast` format
    * Include explanation of link relations structure and semantics
* Add `settings.notifications` to published Server-Sent Events from HyperToast
* HyperToast application instances should send a hypermedia document to the Multigrain `/register` endpoint 
* Parameterize the status endpoint in `SmartRouter.getRoute` so that client's define the status endpoint
* Extend the HyperToast application to support real-time notifications via HTTP callback
* 