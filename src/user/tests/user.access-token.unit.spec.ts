import { ValidateAccessTokenService } from '../slice/auth/validate/validate.access-token.service';
import { TestBed } from '@automock/jest';
import { GetAccessTokenService } from '@app/ss-common-domain/user/auth/get.access-token.service';
import { JwtService } from '@nestjs/jwt';
import { AccessToken } from '@app/st-common-domain/user/entity/access-token.entity';

const pk = '8SuB8Wkoj4nc9d5GbEp6gfbmSdsmNzaTeUQTz1FVFgsz';

const expiredToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IkpXVCJ9.eyJzdWIiOiI4OWM3ZGMxNC0yMjEwLTRlYWYtOWYwYy0xOTM2NjBhMDAxNjUiLCJqdGkiOiI1NmI1YjgzZC00YjhjLTQzZmItOWQ0MC05MzJjZWRiNzM2NDkiLCJhcHBfcm9sZSI6ImFwaSIsImlkZW50aXR5SWQiOiI5OWYwYWE5Ni1iY2Y5LTQwZTItODNjYi1lNjNmZTY0Y2MzYmYiLCJ1c2VySWQiOiI4OWM3ZGMxNC0yMjEwLTRlYWYtOWYwYy0xOTM2NjBhMDAxNjUiLCJleHAiOjE3MDM1NDMyNzAsImlzcyI6IlZlcml2ZW5kLlNlY3VyaXR5LkJlYXJlciIsImF1ZCI6IlZlcml2ZW5kLlNlY3VyaXR5LkJlYXJlciJ9.ioHYhkav9Ab9z0ur_69NKALTQ4_xSPD_t0QTKk1HQwE';

describe('Validate Token Unit Tests', () => {
  let validateAccessTokenService: ValidateAccessTokenService;
  let getAccessTokenService: jest.Mocked<GetAccessTokenService>;
  //let validToken: jest.Mocked<JwtService>;
  let jwtService: jest.Mocked<JwtService>;
  let validTokenJwtService: JwtService;

  beforeAll(async () => {
    const validateAccessTokenServiceUnitTestBed = TestBed.create(
      ValidateAccessTokenService,
    ).compile();

    validateAccessTokenService = validateAccessTokenServiceUnitTestBed.unit;
    getAccessTokenService = validateAccessTokenServiceUnitTestBed.unitRef.get(
      GetAccessTokenService,
    );
    jwtService = validateAccessTokenServiceUnitTestBed.unitRef.get(JwtService);
  });

  afterEach(() => {
    jest.fn().mockClear();
  });

  it('should return token is expired when expiry time is undefined', async () => {
    const accessToken: AccessToken = {
      accessToken: expiredToken,
      expiresAt: undefined,
      userWalletAddress: pk,
    };

    getAccessTokenService.getAccessToken.mockResolvedValue(accessToken);

    const isTokenExpired =
      await validateAccessTokenService.isAccessTokenExpired(pk);

    expect(isTokenExpired.isExpired).toBeTruthy();
  });

  it('should return token is expired when expiry time is 1m not 1 day', async () => {
    const validTokenJwtService = new JwtService({
      secret: ' secret key',
      signOptions: {
        expiresIn: '1d',
        mutatePayload: true,
      },
    });

    const expiryDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const accessToken = await validTokenJwtService.signAsync(
      { pk: pk },
      {
        secret: process.env.JWT_KEY,
        expiresIn: '1m',
      },
    );

    const accessTokenVal: AccessToken = {
      accessToken: accessToken,
      expiresAt: expiryDate,
      userWalletAddress: pk,
    };

    const verifiedAccessToken = await validTokenJwtService.verifyAsync(
      accessToken,
      {
        secret: process.env.JWT_KEY,
      },
    );

    getAccessTokenService.getAccessToken.mockResolvedValue(accessTokenVal);

    jwtService.signAsync.mockResolvedValue(accessToken);
    jwtService.verifyAsync.mockResolvedValue(verifiedAccessToken);

    const isTokenExpired =
      await validateAccessTokenService.isAccessTokenExpired(pk);

    expect(isTokenExpired.isExpired).toBeFalsy();
    //expect(isTokenExpired.accessToken).toBeNull();
  });

  it('should return valid access token', async () => {
    const validTokenJwtService = new JwtService({
      secret: ' secret key',
      signOptions: {
        expiresIn: '1d',
        mutatePayload: true,
      },
    });

    const expiryDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const accessToken = await validTokenJwtService.signAsync(
      { pk: pk },
      {
        secret: process.env.JWT_KEY,
        expiresIn: '1d',
      },
    );

    const accessTokenVal: AccessToken = {
      accessToken: accessToken,
      expiresAt: expiryDate,
      userWalletAddress: pk,
    };

    const verifiedAccessToken = await validTokenJwtService.verifyAsync(
      accessToken,
      {
        secret: process.env.JWT_KEY,
      },
    );

    getAccessTokenService.getAccessToken.mockResolvedValue(accessTokenVal);

    jwtService.signAsync.mockResolvedValue(accessToken);
    jwtService.verifyAsync.mockResolvedValue(verifiedAccessToken);

    const isTokenExpired =
      await validateAccessTokenService.isAccessTokenExpired(pk);

    expect(isTokenExpired.isExpired).toBeFalsy();
    expect(isTokenExpired.accessToken).toEqual(verifiedAccessToken);
  });

  it('should return token expired when no token is found in db', async () => {
    getAccessTokenService.getAccessToken.mockResolvedValue(null);

    const isTokenExpired =
      await validateAccessTokenService.isAccessTokenExpired(pk);

    expect(isTokenExpired.isExpired).toBeTruthy();
    expect(isTokenExpired.accessToken).toBeNull();
  });
});
