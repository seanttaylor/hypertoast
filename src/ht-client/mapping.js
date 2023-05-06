import JsonPointer from 'json-pointer';

/**
 * Takes a given source object and extracts values of interest using a
 * provided map of JSON Pointers
 * @param {Object} source - the object to map to the client domain
 * @param {Object} tags - a map of source object fields to JSON Pointers; used to identify the lookup path for a specific field
 * @param {Object} props - the properties of interest to the client 
 * @return {Object}
 */
export default class DomainMapping {
    constructor ({ source, tags, props }) {
        props.forEach((currentItem) => {
            // ignore tags that don't exist in the `tags` specification
            if (tags[currentItem]) {
                try {
                    this[currentItem] = JsonPointer.get(source, tags[currentItem]);
                } catch(e) {
                    console.error(`Domain mapping error on tag (${currentItem})`);
                }
            }
        });
    }
}