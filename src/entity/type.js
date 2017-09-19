// @flow
import type { InnerEntityProperty } from "../internal/types";

export const innerPrimitiveTypes = [
  "integer",
  "float",
  "double",
  "number",
  "string",
  "boolean",
  "date"
];

export function isPrimitive(type) {
  if (Array.isArray(type)) {
    return innerPrimitiveTypes.includes(type[0]);
  } else {
    return innerPrimitiveTypes.includes(type);
  }
}

/**
 * Description 根据输入的实体类类型与内置的实体对象推测出实体属性
 * @param EntityClass
 * @param innerEntityObject
 * @returns {*}
 */
export function inferenceEntityProperties(
  EntityClass,
  innerEntityObject
): InnerEntityProperty {
  let entityName = EntityClass.name;

  let entityInstance = new EntityClass();

  let propertyNames = Object.getOwnPropertyNames(entityInstance);

  let properties = {};

  if (!innerEntityObject[entityName])
    console.log("AAA", innerEntityObject,entityName);
  if (innerEntityObject[entityName] && innerEntityObject[entityName].properties) {
    let settledProperties = innerEntityObject[entityName].properties;

    for (let settledPropertyName of Object.keys(settledProperties)) {
      properties[settledPropertyName] = Object.assign(
        {},
        settledProperties[settledPropertyName]
      );
    }
  }

  for (let propertyName of propertyNames) {
    if (
      innerEntityObject[entityName] &&
      !(propertyName in innerEntityObject[entityName].properties)
    ) {

      properties[propertyName] = {
        description: propertyName,
        type: inferenceType(entityInstance[propertyName]),
        defaultValue: entityInstance[propertyName]
      };
    } else {
      properties[propertyName].defaultValue !== undefined ||
        (properties[propertyName].defaultValue = entityInstance[propertyName]);
    }
  }

  return properties;
}

/**
 * Description 类型推测
 * @param obj
 * @returns {*}
 */
export function inferenceType(obj: any) {
  if (Array.isArray(obj)) {
    return "array";
  } else {
    return typeof obj;
  }
}
