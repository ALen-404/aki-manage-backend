import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AppService } from './app.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './gql-auth.guard';
@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Mutation(() => String)
  async verifySignature(
    @Args('address') address: string,
    @Args('signature') signature: string,
  ): Promise<string> {
    if (!address || !signature) {
      throw new Error('地址或签名缺失');
    }

    const isValid = await this.appService.validateSignature(address, signature);

    if (!isValid) {
      throw new Error('签名验证失败');
    }

    const token = await this.appService.login(address);
    return token.access_token;
  }
  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  async getAddressLevel(@Context() context): Promise<string> {
    const { address } = context.req.user;

    const level1Array = [
      '0x5752ACCBD98A154f03899d933345f928fB32bFF1',
      '0xc11b02bba83ba5554855ee58f80952b38dafa383',
      '0x536FCb5D414089d3C46f9a5e88e812bDD4345639',
      '0x554dCbAb97cCA8BdB360Cf096E7bE83C9FF08472',
      '0X5B702AFADCA7F2BC1EF117CDBC97E3056969E567',
    ];
    const level2Array = [
      '0xBa3C04Aad1Ea2C54b1573660ba7594828Fc3676B',
      '0XDAA162D82EED13C5CCCDDC5D1BDDB3E39477CAC0',
      '0X656328E4EAAB6804BC39E02BF0FE7A9F1374546C',
    ];
    const level3Array = [
      '0x02c564404882781C29DA894e366C2ba8881DC357',
      '0xb7C6e9D60DFCaFe2eA8E0E3111934233E8E890DF',
    ];
    if (level1Array.includes(address)) {
      return `1`;
    } else if (level2Array.includes(address)) {
      return `2`;
    } else if (level3Array.includes(address)) {
      return `3`;
    } else {
      return '0';
    }
  }
}
