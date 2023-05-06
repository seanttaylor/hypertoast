import Ajv from 'ajv';

const ajv = new Ajv();

/**
 * Validates the body of an incoming API request
 * @param {Object} schemaMap - map of schemas to use for validation
*/
export default function validateRequest(schemaMap) {

  return function validator(req, res, next) {
    const [, schema] = req.headers['accept'].split(';');
    const [, schemaURL] = schema.split('=');

    res.locals.settingsVersion = schemaURL;

    //console.info(`Info: Validating request with schema (${schemaURL})`);
    
    const requestValidation = ajv.compile(schemaMap[schemaURL]);

    if (requestValidation(req.body)) {
      next();
    } else {      
      console.error({
        errors: requestValidation.errors,
        body: req.body
      });
      
      res.status(400).send({
        error: requestValidation.errors,
      });
    }
  };
}