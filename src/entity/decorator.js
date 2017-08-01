// @flow
import {innerEntityObject} from "../internal/singleton";
import {buildDefinitions} from "../swagger/definitions";

/**
 * Description 生成实体类的唯一标识，这里首先默认使用实体类名作为唯一标识
 * @param target
 * @param key
 * @param descriptor
 */
export function generateEntityUUID(target, key, descriptor) {
    return target.constructor.name;
}

/**
 * Description 为某个类加上注解，并且创建新的对象以触发内部迭代注解
 * @param Class
 * @returns {*}
 */
export function entity(Class) {
    new Class();
    return Class;
}

/**
 * Description 创建某个属性的描述
 * @param type 基础类型 self - 表示为自身
 * @param format
 * @param readOnly
 * @param description 描述
 * @param required 是否为必要参数
 * @param defaultValue 默认值
 * @param pattern
 * @param primaryKey 是否为主键
 * @param example
 *
 * @returns {Function}
 */
export function entityProperty({
                                   type = "string",
                                   format = "string",
                                   readOnly = false,
                                   description = "",
                                   required = false,
                                   defaultValue = undefined,
                                   pattern = undefined,
                                   primaryKey = false,
                                   example = undefined
                               }) {
    return function (target, key, descriptor) {
        let entityUUID = generateEntityUUID(target, key, descriptor);

        // 确保实体键存在
        _ensure(entityUUID, key);

        let valueObject = innerEntityObject[entityUUID]["properties"][key];

        // 判断是否为自身
        if (type === "self" || type === undefined) {
            valueObject.type = target.constructor;
        } else if (
            Array.isArray(type) &&
            (type[0] === "self" || type[0] === undefined)
        ) {
            valueObject.type = [target.constructor];
        } else {
            valueObject.type = type;

            // 这里动态编译关联的定义项目，需要根据输入的是否为数组来动态提取出具体的实体类或者对象
            Array.isArray(type) ? buildDefinitions(type[0]) : buildDefinitions(type);
        }

        valueObject.description = description;

        if (required) {
            innerEntityObject[entityUUID]["required"].push(key);
            valueObject.allowNull = false;
        } else {
            valueObject.allowNull = true;
        }

        valueObject.pattern = pattern;
        valueObject.defaultValue = defaultValue;
        valueObject.primaryKey = primaryKey;
        valueObject.example = example;
        valueObject.readOnly = readOnly;
        if (!target.constructor.attrTypes){
            target.constructor.attrTypes = {}
        }
        target.constructor.attrTypes[key] = valueObject;
        descriptor.writable = true;

        return descriptor;
    };
}

/**
 * Description 初始化存储对象
 * @param entityUUID 实体唯一标识，目前也就是实体名
 * @param property 当前的属性名
 * @private
 */
function _ensure(entityUUID, property) {
    innerEntityObject[entityUUID] || (innerEntityObject[entityUUID] = {});

    innerEntityObject[entityUUID]["required"] ||
    (innerEntityObject[entityUUID]["required"] = []);

    innerEntityObject[entityUUID]["properties"] ||
    (innerEntityObject[entityUUID]["properties"] = {});

    innerEntityObject[entityUUID]["properties"][property] ||
    (innerEntityObject[entityUUID]["properties"][property] = {});
}
