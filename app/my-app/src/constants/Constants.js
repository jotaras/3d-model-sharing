import { SUPPORTED_MODEL_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS } from './SystemConstants';

export const CONFIRM_BUTTON_TEXT = 'Ok';
export const CANCEL_BUTTON_TEXT = 'Cancel';
export const CLOSE_IMG_ALT = 'Close';
export const REFRESH_TOKEN_NOT_VALID_ERROR_MESSAGE = 'Refresh token expired, try to relogin';
export const ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE = 'You have no access for this resource';
export const AUTHENTICATION_FAILED_ERROR_MESSAGE = 'Email or password is incorrect';
export const MODELS_MANAGEMENT_BUTTON_TEXT = 'Models';
export const USERS_MANAGEMENT_BUTTON_TEXT = 'Users';
export const LOCK_IMAGE_ALT = 'lock';
export const LOGIN_BUTTON_TEXT = 'Login';
export const LOGOUT_BUTTON_TEXT = 'Logout';
export const HOME_BUTTON_TEXT = 'Home';
export const NAVIGATION_MENU_IMG_ALT = 'Menu';

export const EMAIL_INPUT_PLACEHOLDER = 'Email';
export const PASSWORD_INPUT_PLACEHOLDER = 'Password';
export const LOGIN_TITLE = 'Enter your password and email';
export const EMAIL_NOT_VALID_ERROR_MESSAGE = 'Email is not correct';
export const EMAIL_EMPTY_ERROR_MESSAGE = 'Email cannot be empty';
export const PASSWORD_EMPTY_ERROR_MESSAGE = 'Password cannot be empty';
export const LOGIN_SUBMIT_BUTTON_TEXT = 'Login';

export const CLOSE_MODEL_FORM_ALT = 'Close';
export const FORM_INPUT_NAME_PLACEHOLDER = 'Name';
export const FORM_INPUT_DESCRIPTION_PLACEHOLDER = 'Description';
export const FORM_INPUT_MODEL_PREVIEW_TEXT = 'Upload preview';
export const FORM_INPUT_MODEL_FILE_TEXT = 'Upload CAD file';
export const FORM_TAGS_LABEL = 'Tags:';
export const FORM_INPUT_TAG_PLACEHOLDER = 'Tag';
export const FORM_ADD_TAG_BUTTON_TEXT = 'Add';
export const SUBMIT_BUTTON_TEXT = 'Submit';
export const MODEL_NAME_EMPTY_ERROR_MESSAGE = 'Specify model name';
export const MODEL_FILE_EMPTY_ERROR_MESSAGE = 'Upload model file';
export const MODEL_UPDATED_MESSAGE = 'Model updated';
export const MODEL_CREATED_MESSAGE = 'Model created';
export const TAG_LENGTH_ERROR_MESSAGE = 'Tag length should be less than 15';
export const MODEL_DESCR_SIZE_ERROR_MESSAGE = 'Description length exceeded 200';
export const MODEL_NAME_SIZE_ERROR_MESSAGE = 'Model name length exceeded 40';
export const MODEL_DESCR_EMPTY_ERROR_MESSAGE = 'Specify model description';

export const PICTURE_SORT_BUTTON_TEXT = 'Picture';
export const NAME_SORT_BUTTON_TEXT = 'Name';
export const DECRIPTION_SORT_BUTTON_TEXT = 'Description';
export const TAGS_SORT_BUTTON_TEXT = 'Tags';
export const LAST_UPDATE_SORT_BUTTON_TEXT = 'Last Update';
export const ACTIONS_SORT_BUTTON_TEXT = 'Actions';
export const DELETE_MODEL_IMAGE_ALT = 'Delete';
export const UPDATE_MODEL_IMAGE_ALT = 'Edit';
export const PREVIEW_IMAGE_ALT = 'Preview';
export const NEW_MODEL_BUTTON_NAME = 'New';
export const SEARCH_MODEL_PLACEHOLDER = 'Search';
export const MODEL_DELETED_MESSAGE = 'Model deleted';
export const DELETE_MODEL_CONFIRM_TEXT = 'Are you sure you want to delete this model?';
export const MODELS_LOADING_TEXT = 'Loading';
export const CARET_DOWN_ICON_IMAGE_ALT = 'Desc';
export const CARET_UP_ICON_IMAGE_ALT = 'Asc';
export const CARET_DIRECTION_ICON_IMAGE_ALT = 'Sort';


export const USER_UPDATED_MESSAGE = 'User updated';
export const USER_CREATED_MESSAGE = 'User created';
export const FIRST_NAME_EMPTY_ERROR_MESSAGE = 'Specify first name';
export const FIRST_NAME_NOT_VALID_ERROR_MESSAGE = 'First name must contain only letters';
export const LAST_NAME_EMPTY_ERROR_MESSAGE = 'Specify last name';
export const LAST_NAME_NOT_VALID_ERROR_MESSAGE = 'Last name must contain only letters';
export const PASSWORD_LENGTH_ERROR_MESSAGE = 'Password length should be between 4-25 characters';
export const PASSWORD_ONLY_WITH_SPACES_ERROR_MESSAGE = 'The password cannot consist of spaces only';
export const ROLES_EMPTY_ERROR_MESSAGE = 'Select at least one role';
export const FIRST_NAME_INPUT_PLACEHOLDER = 'First Name';
export const LAST_NAME_INPUT_PLACEHOLDER = 'Last Name';
export const SELECT_ROLE_MESSAGE = 'Select role';
export const ADD_ROLE_BUTTON_TEXT = 'Add';
export const FORM_INPUT_PICTURE_TEXT = 'Choose picture';
export const CLOSE_USER_FORM_ALT = 'Close';
export const COULD_NOT_LOAD_IMAGE_ERROR_MESSAGE = 'Could\'nt load image';

export const FIRST_NAME_SORT_BUTTON_TEXT = 'First Name';
export const LAST_NAME_SORT_BUTTON_TEXT = 'Last Name';
export const EMAIL_SORT_BUTTON_TEXT = 'Email';
export const ROLES_SORT_BUTTON_TEXT = 'Roles';
export const NEW_USER_BUTTON_TEXT = 'New';
export const USER_DELETED_MESSAGE = 'User deleted';
export const DELETE_USER_CONFIRM_TEXT = 'Are you sure you want to delete user?';
export const DELETE_USER_IMAGE_ALT = 'Delete';
export const UPDATE_USER_IMAGE_ALT = 'Edit';
export const SEARCH_USER_PLACEHOLDER  = 'Search';
export const USERS_LOADING_TEXT = 'Loading';
export const USER_PROFILE_IMAGE_ALT = 'Picture';

export const SELECTED_TAGS_LABEL = 'Selected tags:';
export const ADD_TAG_IMAGE_ALT = 'Add tag';
export const EXPAND_MODEL_IMAGE_ALT = 'Expand';
export const DOWNLOAD_MODEL_BUTTON_TEXT = 'Download';
export const PREVIEW_MODEL_BUTTON_TEXT = 'Preview';
export const VIEW_MODEL_BUTTON_TEXT = 'View';
export const LAST_UPDATED_LABEL = 'Last';
export const UPDATED_BY_LABEL = 'User';
export const UPDATED_DATE_LABEL = 'Date';
export const ADD_TAG_LABEL_TEXT = 'Filter by tag:';

export const MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE = `Only ${Object.values(SUPPORTED_MODEL_EXTENSIONS).join(', ')} files can be displayed`;
export const MODEL_FILE_IS_NOT_ALLOWED_ERROR_MESSAGE = `Please upload one of ${Object.values(SUPPORTED_MODEL_EXTENSIONS).join(', ')} models`;
export const IMAGE_FILE_IS_NOT_ALLOWED_ERROR_MESSAGE = `Please upload one of ${Object.values(SUPPORTED_IMAGE_EXTENSIONS).join(', ')} images`;
export const BACK_IMAGE_ALT = 'Back';

export const AUTHORIZATION_ERROR_MESSAGE = 'Authorization problems, try to relogin';

export const ADD_PLANE_BUTTON_TEXT = 'Plane';
export const CUT_MODEL_BUTTON_TEXT = 'Cut';
export const DELETE_MODEL_BUTTON_TEXT = 'Delete';
export const MODEL_NOT_SELECTED_ERROR_MESSAGE = 'Select model by double click';
export const PLANE_NOT_AT_SCENE_ERROR_MESSAGE = 'Add plane first';
export const MODEL_NOT_SUPPORTED_FOR_CUTTING_ERROR_MESSAGE = 'This model is not supported for cutting';
