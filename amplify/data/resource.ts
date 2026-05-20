import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // ユーザーごとに家計簿データを丸ごと1レコードで保存する
  UserData: a
    .model({
      payload: a.json().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
