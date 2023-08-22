import { type BotState } from 'botbuilder-core';

import { type UserProfile, type UserDataBinder, getUserProfile } from '../user-profile';

type Constructor = new (...args: any[]) => object;

// https://www.typescriptlang.org/docs/handbook/mixins.html
function MemorisationDialog<Tbase extends Constructor> (Base: Tbase) {
  return class Extended extends Base {
    public _userProfile?: UserDataBinder<UserProfile>;

    public initializeUserProfile (userState: BotState) {
      const initialData = {
        name: '',
        age: -1,
        companiesToReview: []
      }
      this._userProfile = getUserProfile(userState, initialData);
    }

    public get userProfile (): UserDataBinder<UserProfile> {
      if (this._userProfile === undefined) {
        throw new Error(`Inproper setup for class that is inherited from MemorisationDialog, 
          to fix it invoke this.initializeUserProfile in constructor`);
      }

      return this._userProfile;
    }
  }
}

export default MemorisationDialog;
