import { ComponentDialog } from 'botbuilder-dialogs';

import MemorisationDialog from './memorisation-dialog';

const MyComponentDialog = MemorisationDialog<typeof ComponentDialog<object>>(ComponentDialog);

export default MyComponentDialog;
