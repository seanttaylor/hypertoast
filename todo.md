* Scaffold description of the `application/vnd.hypertoast` format
    * Include explanation of link relations structure and semantics
* Refactor settings schema to include a *required* `version` property
* Embed calls to `getLinkIdentifiers` and `getServiceObjectTags` directly into the call to `displayDeviceMarquee`
* Remove `schema` directive inside `Accept` headers
    * User hypertoast version *only* to infer the correct schema for clients to use where appropriate
* Investigate templating tag URLs with URI templates
