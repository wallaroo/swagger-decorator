// @flow
const pathToRegexp = require("path-to-regexp");
import {innerAPIObject} from "../internal/singleton";
import {swaggerJSON} from "./template/swagger.json";

let hasBuilt = false;

/**
 * Description 构建 Swagger JSON 文件
 */
export function buildSwaggerJSON() {
    if (hasBuilt) {
        return;
    }

    swaggerJSON["paths"] = {};

    for (let key of Object.keys(innerAPIObject)) {
        let value = innerAPIObject[key];

        let parentKey = `${value.instance.target.__proto__.name}-${value.instance
            .key}`;

        if (!value.requestMapping) {
            continue;
        }

        let requestPath = _convertParameterInPath(value.requestMapping.path);

        if (!swaggerJSON["paths"][requestPath])
            swaggerJSON["paths"][requestPath] = {};

        swaggerJSON["paths"][requestPath][value.requestMapping.method] = {};

        let apiDoc = swaggerJSON["paths"][requestPath][value.requestMapping.method];

        apiDoc.description = value.description.description;

        apiDoc.produces = value.description.produces;

        apiDoc.parameters = [];

        const merge = key => {
            return []
                .concat(
                    innerAPIObject[parentKey] ? innerAPIObject[parentKey][key] || [] : []
                )
                .concat(value[key] || []);
        };

        let pathParameter = merge("pathParameter");

        for (let param of pathParameter) {
            apiDoc.parameters.push({
                ...param,
                collectionFormat: "csv"
            });
        }

        let queryParameter = merge("queryParameter");

        for (let param of queryParameter) {
            apiDoc.parameters.push({
                ...param,
                items: {
                    type:
                        param.items && param.items.length > 0 ? param.items[0] : undefined
                },
                collectionFormat: "csv"
            });
        }

        let bodyParameter = merge("bodyParameter");

        for (let param of bodyParameter) {
            apiDoc.parameters.push({
                ...param,
                schema: _convertSchema(param.schema)
            });
        }

        apiDoc.responses = {};

        let responses = merge("responses");

        for (let resp of responses) {
            apiDoc.responses[resp.statusCode] = {
                description: resp.description,
                schema: _convertSchema(resp.schema)
            };
        }
    }

    hasBuilt = true;
}

export function _convertSchema(schema: any) {
    let convertedSchema;

    if (Array.isArray(schema) && schema.length > 0) {
        convertedSchema = {
            type: "array",
            items: {
                $ref: `#/definitions/${schema[0].name}`
            }
        };
    }

    if (typeof schema === "function") {
        convertedSchema = {
            $ref: `#/definitions/${schema.name}`
        };
    }

    return convertedSchema;
}

/**
 * Description
 * @param path
 * @private
 */
export function _convertParameterInPath(path: String) {
    let segments = [];

    const re = pathToRegexp(path, segments);

    if (segments.length === 0) {
        return path;
    } else {
        let convertedPath = path;

        for (let segment of segments) {
            convertedPath = convertedPath.replace(
                new RegExp(`${segment.prefix}:${segment.name}`, "g"),
                `${segment.prefix}{${segment.name}}`
            );
        }

        return convertedPath;
    }
}
