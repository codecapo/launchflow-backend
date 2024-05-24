import { GetAccessTokenRepo } from '../slice/auth/get/get.access-token.repo';
import { GetSignInRequestRepo } from '../slice/auth/get/get.sign-in-request.repo';
import { RevokeAccessTokenRepo } from '../slice/auth/revoke/revoke.access-token.repo';
import { SaveAccessTokenRepo } from '../slice/auth/save/save.access-token.repo';
import { SaveSignInRequestRepo } from '../slice/auth/save/save-sign-in-request.repo';
import { GetAccessTokenService } from '../slice/auth/get/get.access-token.service';
import { GetSignInRequestService } from '../slice/auth/get/get.sign-in-request.service';
import { ManageUserAuthService } from '../slice/auth/manage/manage.user-auth.service';
import { RevokeAccessTokenService } from '../slice/auth/revoke/revoke.access-token.service';
import { SaveAccessTokenService } from '../slice/auth/save/save.access-token.service';
import { SaveSignInRequestService } from '../slice/auth/save/save.sign-in-request.service';
import { TestBed } from '@automock/jest';
import { AccessToken } from '@app/st-common-domain/user/entity/access-token.entity';
import { SignInRequest } from '@app/st-common-domain/user/entity/sign-in-request.entity';
import { EncryptionService } from '@app/encryption';
import { GetUsersService } from '../slice/manage/get/get.user.service';
import { CreateUserService } from '../slice/manage/create/create.user.service';
import { User } from '@app/st-common-domain/user/entity/user.entity';
import { ValidateAccessTokenService } from '../slice/auth/validate/validate.access-token.service';
import { JwtService } from '@nestjs/jwt';

const msg =
  'CkEPqd6Hn8TFFni9hvky6GJ8amLCtW5X5kW1p1HsZbu1ueGaqma2aJTe3nTqk1xZcZ1NBhh5kM3LMuDqy5xKcXs12nz2e8pAf99V8Epqv9xhjZtqz6yrxsbjxAoMP2UvxCSzMrnhjqAWHfB69v3w62BE1WjtD31eSveAKwhu3GuphJy23prwdTwHfTLGjKGBrnbtsiPyPakcMYr32E4cjZ6wBFpVHefzSqmK6ySEzwyMLVBRUDTx7MHAeYJusZaz6XRLmy8iz2UsGLxCirbNeeCsgLchq2172EGkWVitj9M8Kuiy35dbr5EF6JZv5eEU29PT4VGDdCYG3zSGTCAkKM18UfagvxjZRqKHERXumpPNU2VKMK1XCW7S9N5w4Z2XGWWrDZn5WyNdqtFUdKU7o95Ceo3QnD9wuxNTu2xVVRqfTjHFUmNhdfan6KA7zteVerHqtNWWW8nG8ciyhEQVYvJT6Dyj9MtTcYJHTSqbtvHBh2yFA615EYjwPpBpx9ykCS8mTwyKoD436t2JhfswrYiECXeTVt18zB35TE3qHXR4TTM6v71o9EsZsX7ntubeZZ9HdLEnWiZEnDRMCK3YsDvTzRdWdo21AztnjoKPT32iXqab6Ep';

const msgInvalid =
  '1111CkEPqd6Hn8TFFni9hvky6GJ8amLCtW5X5kW1p1HsZbu1ueGaqma2aJTe3nTqk1xZcZ1NBhh5kM3LMuDqy5xKcXs12nz2e8pAf99V8Epqv9xhjZtqz6yrxsbjxAoMP2UvxCSzMrnhjqAWHfB69v3w62BE1WjtD31eSveAKwhu3GuphJy23prwdTwHfTLGjKGBrnbtsiPyPakcMYr32E4cjZ6wBFpVHefzSqmK6ySEzwyMLVBRUDTx7MHAeYJusZaz6XRLmy8iz2UsGLxCirbNeeCsgLchq2172EGkWVitj9M8Kuiy35dbr5EF6JZv5eEU29PT4VGDdCYG3zSGTCAkKM18UfagvxjZRqKHERXumpPNU2VKMK1XCW7S9N5w4Z2XGWWrDZn5WyNdqtFUdKU7o95Ceo3QnD9wuxNTu2xVVRqfTjHFUmNhdfan6KA7zteVerHqtNWWW8nG8ciyhEQVYvJT6Dyj9MtTcYJHTSqbtvHBh2yFA615EYjwPpBpx9ykCS8mTwyKoD436t2JhfswrYiECXeTVt18zB35TE3qHXR4TTM6v71o9EsZsX7ntubeZZ9HdLEnWiZEnDRMCK3YsDvTzRdWdo21AztnjoKPT32iXqab6Ep';

const pk = '8SuB8Wkoj4nc9d5GbEp6gfbmSdsmNzaTeUQTz1FVFgsz';
const pk2 = '8kD4c8cU3ShPst4jbDfMtuJqQ6RSvgyQPhsE46y7fgS6';
const sig =
  '2NhY2Je5whFFot2wZf9cSa9Tm1CmxtFPcEHGYULn71Q5vChG49g8gSgsKKyFLhYzgMR7H4vh7VVm3fu3eymFTwss';
const subMessage =
  'AQICAHhAKaK+MtvPXJ9QGonscwhMCY4pU/5hyXy7Kh3N/7e4zgGwB/txl9JEf3fQi/ZqhXFBAAAAgzCBgAYJKoZIhvcNAQcGoHMwcQIBADBsBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDJgOs/jfFQGetey+KgIBEIA/f3UEAuG1QAuf3YDPhAAP3GSqU1fxdAPlptsjnVMbpjDVQ/r0yMH2PrlHXWLvJC+jImBqLmqkyppncT79fw45';

describe('User Authentication Tests', () => {
  let getAccessTokenService: GetAccessTokenService;
  let getSignInRequestService: GetSignInRequestService;
  let manageUserAuthService: ManageUserAuthService;
  let revokeAccessTokenService: RevokeAccessTokenService;
  let saveAccessTokenService: SaveAccessTokenService;
  let saveSignInRequestService: SaveSignInRequestService;

  let getAccessTokenRepo: jest.Mocked<GetAccessTokenRepo>;
  let getSignInRequestRepo: jest.Mocked<GetSignInRequestRepo>;
  let revokeAccessTokenRepo: jest.Mocked<RevokeAccessTokenRepo>;
  let saveAccessTokenRepo: jest.Mocked<SaveAccessTokenRepo>;
  let saveSignInRequestRepo: jest.Mocked<SaveSignInRequestRepo>;
  let encryptionServiceInManageUserAuthService: jest.Mocked<EncryptionService>;
  let getSignInRequestServiceManageUserAuthService: jest.Mocked<GetSignInRequestService>;
  let getUserServiceManageUserAuthService: jest.Mocked<GetUsersService>;
  let createUserServiceManageUserAuthService: jest.Mocked<CreateUserService>;
  let validateAccessTokenServiceManageUserAuthService: jest.Mocked<ValidateAccessTokenService>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const getAccessTokenServiceUnitTestBed = TestBed.create(
      GetAccessTokenService,
    ).compile();

    const getSignInRequestServiceUnitTestBed = TestBed.create(
      GetSignInRequestService,
    ).compile();

    const manageUserAuthServiceUnitTestBed = TestBed.create(
      ManageUserAuthService,
    ).compile();

    const revokeAccessTokenServiceUnitTestBed = TestBed.create(
      RevokeAccessTokenService,
    ).compile();

    const saveAccessTokenServiceUnitTestBed = TestBed.create(
      SaveAccessTokenService,
    ).compile();

    const saveSignInRequestServiceUnitTestBed = TestBed.create(
      SaveSignInRequestService,
    ).compile();

    getAccessTokenService = getAccessTokenServiceUnitTestBed.unit;
    getAccessTokenRepo =
      getAccessTokenServiceUnitTestBed.unitRef.get(GetAccessTokenRepo);

    getSignInRequestService = getSignInRequestServiceUnitTestBed.unit;
    getSignInRequestRepo =
      getSignInRequestServiceUnitTestBed.unitRef.get(GetSignInRequestRepo);

    manageUserAuthService = manageUserAuthServiceUnitTestBed.unit;
    encryptionServiceInManageUserAuthService =
      manageUserAuthServiceUnitTestBed.unitRef.get(EncryptionService);
    getSignInRequestServiceManageUserAuthService =
      manageUserAuthServiceUnitTestBed.unitRef.get(GetSignInRequestService);
    getUserServiceManageUserAuthService =
      manageUserAuthServiceUnitTestBed.unitRef.get(GetUsersService);
    createUserServiceManageUserAuthService =
      manageUserAuthServiceUnitTestBed.unitRef.get(CreateUserService);
    validateAccessTokenServiceManageUserAuthService =
      manageUserAuthServiceUnitTestBed.unitRef.get(ValidateAccessTokenService);
    jwtService = manageUserAuthServiceUnitTestBed.unitRef.get(JwtService);

    revokeAccessTokenService = revokeAccessTokenServiceUnitTestBed.unit;
    revokeAccessTokenRepo = revokeAccessTokenServiceUnitTestBed.unitRef.get(
      RevokeAccessTokenRepo,
    );

    saveAccessTokenService = saveAccessTokenServiceUnitTestBed.unit;
    saveAccessTokenRepo =
      saveAccessTokenServiceUnitTestBed.unitRef.get(SaveAccessTokenRepo);

    saveSignInRequestService = saveSignInRequestServiceUnitTestBed.unit;
    saveSignInRequestRepo = saveSignInRequestServiceUnitTestBed.unitRef.get(
      SaveSignInRequestRepo,
    );
  });

  it('should get access token', async () => {
    const mockAccessToken = new AccessToken();

    mockAccessToken.accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwayI6IjhTdUI4V2tvajRuYzlkNUdiRXA2Z2ZibVNkc21OemFUZVVRVHoxRlZGZ3N6IiwiaWF0IjoxNzE1ODA2MjUzLCJleHAiOjE3MTU4OTI2NTN9.FZoNEPXyfdHM5UPm10eAmDPrbntreaNKwzIOrhWcHAU';

    getAccessTokenRepo.findAccessTokenByUserId.mockResolvedValue(
      mockAccessToken,
    );

    const accessToken = await getAccessTokenService.getAccessToken(
      '8SuB8Wkoj4nc9d5GbEp6gfbmSdsmNzaTeUQTz1FVFgsz',
    );

    expect(getAccessTokenRepo.findAccessTokenByUserId).toHaveBeenCalled();
    expect(accessToken).toEqual(mockAccessToken);
  });

  it('should get sign in request', async () => {
    const mockSignInRequest = new SignInRequest();

    mockSignInRequest.nounce = 'nounceText';

    getSignInRequestRepo.getSignInRequest.mockResolvedValue(mockSignInRequest);

    const signInRequest =
      await getSignInRequestService.getSignInRequest('nounceText');

    expect(getSignInRequestRepo.getSignInRequest).toHaveBeenCalled();
    expect(signInRequest).toEqual(mockSignInRequest);
  });

  it('should call valid sign in object', async () => {
    const manage = await manageUserAuthService.userSignIn();

    expect(manage.domain).toEqual('localhost:3000');
    expect(manage.statement).toEqual(
      'Solana Stack wants to sign you in using your wallet',
    );
    expect(manage.version).toEqual('1');
    expect(manage.nonce).toBeUndefined();
    expect(manage.chainId).toEqual('devnet');
  });

  it('should verify wallet sign in when valid msg sig and pk is provided', async () => {
    const signInRequest = new SignInRequest();
    signInRequest.nounce = subMessage;
    signInRequest.requestId = '32a77880-7b8e-4786-8f5e-2f60bb8c33ac';

    getSignInRequestServiceManageUserAuthService.getSignInRequest.mockResolvedValue(
      signInRequest,
    );

    encryptionServiceInManageUserAuthService.kmsDecryptAndVerify.mockResolvedValue(
      signInRequest.nounce,
    );

    getSignInRequestRepo.getSignInRequest.mockResolvedValue(signInRequest);

    const manage = await manageUserAuthService.verifyWalletSignIn(msg, sig, pk);
    expect(manage).toBeTruthy();
  });

  it('should return false if incorrect details are provided', async () => {
    const signInRequest = new SignInRequest();
    signInRequest.nounce = subMessage;
    signInRequest.requestId = '32a77880-7b8e-4786-8f5e-2f60bb8c33ac';

    getSignInRequestServiceManageUserAuthService.getSignInRequest.mockResolvedValue(
      signInRequest,
    );

    encryptionServiceInManageUserAuthService.kmsDecryptAndVerify.mockResolvedValue(
      signInRequest.nounce,
    );

    getSignInRequestRepo.getSignInRequest.mockResolvedValue(signInRequest);

    const manage = await manageUserAuthService.verifyWalletSignIn(
      msgInvalid,
      sig,
      pk,
    );

    expect(manage).toBeFalsy();
  });

  it('should get user if user exists', async () => {
    const mockUser: User = { publicKey: pk };

    getUserServiceManageUserAuthService.getUser.mockResolvedValue(mockUser);

    const user = await manageUserAuthService.getUserOrCreateIfUserNotExist(pk);

    expect(user).toEqual(mockUser);
  });

  it('should create user if it exists', async () => {
    const mockUser: User = { publicKey: pk2 };

    getUserServiceManageUserAuthService.getUser.mockResolvedValue(mockUser);

    const user = await manageUserAuthService.getUserOrCreateIfUserNotExist(pk2);

    expect(user).toEqual(mockUser);
  });

  it('should create user  it exists', async () => {
    const mockUser: User = { publicKey: pk2 };

    const user = await manageUserAuthService.getUserOrCreateIfUserNotExist(pk2);

    expect(user).toEqual(mockUser);
  });
});

// manage jwt
// if access token is greater than settings time, then return access token is expired
// if access token expired, should create new access token, save it and return it
// if access token not expired, should revoke access token, save it and return it
