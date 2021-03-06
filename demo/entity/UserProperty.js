// @flow
import { entityProperty } from "../../src/entity/decorator";

export default class UserProperty {
  // 朋友列表
  @entityProperty({
    type: ["number"],
    description: "user friends, which is user ids",
    required: false
  })
  friends: [number];
}
