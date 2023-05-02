# HyperToast

A hypermedia-enabled smart toaster

## Overview

HyperToast manages requests for new toast via a RESTful API.

## Local Development

* Single Instance
    * Do `docker-compose up`
    * The Reuben client will automatically launch a single request for toast

* Cluster Mode
    * Do `docker-compose -f docker-compose-multigrain.yml up`
    * Make a `PUT` request against the broker endpoint `/multigrain/v1/toast` with following example  payload:

    ```
    {
        "mode": "bagel",
        "cookConfig": {
            "level": 1,
            "timer": {
            "1": 50000,
            "2": 120000
            }
        },
        "notifications": {
            "shouldNotify": true,
            "type": [
            "sse"
            ]
        }
    }    
     ```

Execute this requests a few times and note the enqueueing of toast requests via the Multigrain broker. Observe the HyperToast instances processing the toast requests as individual cooking cycles complete.

### States
An instance of HyperToast is a stateful service. When a request for toast comes in, the service transitions through four discrete states. They are as follows:

* On
    * On receiving a toast request the device initializes in this state. The API will reject new toast requests in this state with a `400` status code.
* Preheating
    * The device is preparing to process (cook) the toast request. The API will reject new toast requests in this state with a `400` status code.
* Cooking
    * The device is processing (cooking) the toast. The API will reject new toast requests in this state with a `400` status code.
* Off
    * The device has finished cooking the toast. Clients on version `0.0.2` of the HyperToast service can opt-in to receive a push notification when the device enters this state. The device is now ready to receive new toast requests.

## Going Further

In order to scale HyperToast, we introduce multiple replicas of the original HyperToast instance to support increased demand for toast (think breakfast buffet at a hotel conference space). 

We also introduce a broker service called Multigrain that accepts requests for clients who want toast, queues those incoming requests and routes the requests to the next available HyperToast instance.

When a request for toast is routed to a HyperToast instance that is already cooking toast, Multigrain leaves the pending toast request in the queue until a HyperToast replica instance becomes available to process a new request.

![Architectural Diagram](/docs/multigrain-architectural-diagram.png)

### References and Further Reading


* [Justice Will Take Us Millions Of Intricate Moves](https://www.crummy.com/writing/speaking/2008-QCon/)
    * Key insight from the above [here](https://www.crummy.com/writing/speaking/2008-QCon/act3.html)
* [HAL Hypermedia Format Specification](https://datatracker.ietf.org/doc/html/draft-kelly-json-hal)
* [A RESTful Hypermedia API in Three Easy Steps](http://www.amundsen.com/blog/archives/1041)
