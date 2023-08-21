import {
  type BotState,
  type StatePropertyAccessor,
  type TurnContext
} from 'botbuilder-core';

import { USER_PROFILE_PROPERTY } from './constants';

export type UserProfile = {
  name: string | '';
  age: number | -1;
  companiesToReview: string[];
}

export class UserDataBinder<T> {
  readonly access_property = USER_PROFILE_PROPERTY;
  readonly _accessor: StatePropertyAccessor<T>;
  readonly _default: T;

  constructor (botState: BotState, initialData: T) {
    this._accessor = botState.createProperty<T>(this.access_property);
    this._default = initialData;
  }

  public async get (turnContext: TurnContext): Promise<T> {
    return await this._accessor.get(turnContext, this._default);
  }

  public async update (turnContext: TurnContext, data: Partial<T>) {
    const stored = await this.get(turnContext);
    const toBeUpdated = { ...stored, ...data }
    await this._accessor.set(turnContext, toBeUpdated);
  }
}

const userDataBinderFactory = <T>() => {
  let userDataBinder: UserDataBinder<T>;

  return (userState: BotState, initialData: T): UserDataBinder<T> => {
    if (userDataBinder === undefined) {
      userDataBinder = new UserDataBinder<T>(userState, initialData);
    }
    return userDataBinder;
  }
}

export const getUserProfile = userDataBinderFactory<UserProfile>();
