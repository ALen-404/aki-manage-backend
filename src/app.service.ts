import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';
import { PrismaService } from './prisma.service';
import { Inject } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';

@Resolver()
export class AppService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  @Query('Airdrops')
  async Airdrop(
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Args('id') id?: string,
    @Args('name') name?: string,
    @Args('start_date') start_date?: string,
    @Args('end_date') end_date?: string,
    @Args('is_active') is_active?: string,
  ) {
    const prisma = this.prismaService;
    // 查询条件
    const whereCondition: any = {};

    // 根据传入的 id 参数决定
    if (id) {
      whereCondition.airdrop_id = id;
    }
    // 根据传入的 name 进行模糊查询
    if (name) {
      whereCondition.title = { contains: name }; // "name"为你想要进行模糊查询的字段名；若字段名有误，请替换为实际名称
    }

    // 根据传入的 start_date 和 end_date 参数决定
    if (start_date && end_date) {
      whereCondition.start_date = { gte: new Date(start_date).toISOString() };
      whereCondition.end_date = { lte: new Date(end_date).toISOString() };
    }

    // 根据传入的 is_active 参数决定
    const currentDate = new Date().toISOString();
    if (is_active === 'Incomplete') {
      whereCondition.end_date = { gt: currentDate };
    } else if (is_active === 'Completed') {
      whereCondition.end_date = { lt: currentDate };
      whereCondition.listed = 'true'; // 添加 listed 为 true 的条件
    }

    const airdropInfo = await prisma.airdrop.findMany({
      where: whereCondition,
      include: {
        airdrop_participation: true,
        airdrop_referral: true,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        end_date: 'desc',
      },
    });
    const total = await prisma.airdrop.count({
      where: whereCondition,
    });

    const akiUsers = await prisma.akiusers.findMany();
    const referralCodes = await prisma.referralcodes.findMany();

    const userMap = new Map(akiUsers.map((user) => [user.user_id, user]));
    const referralCodeMap = new Map(
      referralCodes.map((code) => [code.referral_id, code.user_id]),
    );

    const airdropInfoInit = airdropInfo.map((item) => {
      const referralInfo = item.airdrop_referral.map((referral) => {
        const address = referral.walletAddress
          ? referral.walletAddress.toLocaleLowerCase()
          : '';
        const matchingItem = item.airdrop_participation.find(
          (dataItem) => dataItem.wallet.toLocaleLowerCase() === address,
        );
        let referralWallet = '';
        const pattern =
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        const trimmedString = referral.referralCode?.replace(/\s/g, '');

        if (pattern.test(trimmedString)) {
          const userId = referralCodeMap.get(referral.referralCode);
          const user = userMap.get(userId);
          referralWallet = user?.address || '';
        }

        return {
          wallet: referral.walletAddress,
          twitter: matchingItem?.twitter,
          converted: referral.converted,
          referralCode:
            referral?.referralCode !== 'undefined' ? referral.referralCode : '',
          referralWallet: referralWallet,
        };
      });
      function compareByBoolean(a, b) {
        if (a.converted && !b.converted) {
          return -1;
        }
        if (!a.converted && b.converted) {
          return 1;
        }
        return 0;
      }
      const sortReferralDataList = referralInfo.sort(compareByBoolean);

      // 过滤重复数据
      const existingAddressesMap = new Map();
      const filteredData = sortReferralDataList.filter((item) => {
        if (existingAddressesMap.has(item.wallet)) {
          const existingConverted = existingAddressesMap.get(item.wallet);
          if (item.converted && !existingConverted) {
            existingAddressesMap.set(item.wallet, item.converted);
          }
          return false;
        } else {
          existingAddressesMap.set(item.wallet, item.converted);
          return true;
        }
      });

      const referralNumberMap = new Map();
      const completeData = filteredData.map((item) => {
        let referralNumber = 0;
        let convertedNumber = 0;

        filteredData.forEach((innerItem) => {
          if (
            innerItem.referralWallet &&
            innerItem.referralWallet === item.wallet
          ) {
            referralNumber++;
            if (innerItem.converted) {
              convertedNumber++;
            }
          }
        });

        const convertedRate =
          referralNumber === 0 ? 0 : (convertedNumber / referralNumber) * 100;
        const initItem = {
          wallet: item.wallet,
          twitter: item.twitter,
          converted: item.converted,
          referralCode: item.referralCode,
          referralWallet: item.referralWallet,
          referralNumber: referralNumber,
          convertedNumber: convertedNumber,
          convertedRate: `${convertedRate.toFixed(2)}%`,
        };
        referralNumberMap.set(item.wallet, referralNumber);
        return initItem;
      });
      function compareByReferralNumber(a, b) {
        if (a.converted !== b.converted) {
          return a.converted ? -1 : 1; // 先排 converted 为 true 的数据
        } else {
          return b.referralNumber - a.referralNumber; // converted 相同时，根据 referralNumber 的大小进行排序
        }
      }
      const sortCompleteData = completeData.sort(compareByReferralNumber);

      const joinCount = sortCompleteData.length;
      const convertedTrueCount = sortCompleteData.filter(
        (i) => i.converted,
      ).length;
      const referralCodeConvertedCount = sortCompleteData.filter(
        (item) => item.referralCode && item.converted,
      ).length;
      const convertedRate = new BigNumber(convertedTrueCount)
        .div(joinCount)
        .times(100)
        .toFixed(2);
      const referralCodeCount = sortCompleteData.filter(
        (i) => i.referralCode,
      ).length;

      return {
        ...item,
        airdrop_participation: item.airdrop_participation,
        referralInfo: sortCompleteData,
        visitors: joinCount,
        conversions: convertedTrueCount,
        conversionRate: convertedRate === 'NaN' ? '0.00%' : `${convertedRate}%`,
        listed: item.listed === '1' || item.listed === 'true' ? true : false,
        microInfluencers: 0,
        referredVisitors: referralCodeCount,
        referredConversions: referralCodeConvertedCount,
        total: total,
        // isOfficial:
        updateTime: new Date().toISOString(),
      };
    });

    return airdropInfoInit;
  }

  constructor(private readonly jwtService: JwtService) {}
  @Mutation('verifySignature')
  async validateSignature(
    address: string,
    signature: string,
  ): Promise<boolean> {
    const message = 'login:aki-manage';

    const recoveredAddress = ethers.verifyMessage(message, signature);

    return recoveredAddress.toLowerCase() === address.toLowerCase();
  }

  async login(address: string) {
    const payload = { address };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
