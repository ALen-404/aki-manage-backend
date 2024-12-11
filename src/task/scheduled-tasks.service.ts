import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import BigNumber from 'bignumber.js';
import { FirestoreConfig } from 'src/firestore.config';

@Injectable()
export class ScheduledTasksService {
  constructor(private readonly firestoreConfig: FirestoreConfig) {}

  @Cron('35 20 * * *', { timeZone: 'Asia/Shanghai' })
  async handleCron() {
    console.log('-开始执行定时任务-');

    const dataToProcess = await this.getDataToProcess(); // 获取要处理的数据
    for (const airdrop of dataToProcess) {
      const processedData = await this.processData(airdrop); // 处理数据
      await this.saveProcessedData(processedData); // 存储处理后的数据到 Firestore
    }
    console.log('-所有文档处理完毕-');
  }

  async getDataToProcess() {
    console.log('-开始获取数据-');

    const firestore = this.firestoreConfig.getFirestore();
    const campaignsCollection = firestore.collection('airdrops');
    // const snapshot = await campaignsCollection.get();
    const snapshot = await campaignsCollection
      .orderBy('campaign.start_date', 'desc')
      .get();

    console.log(`-总Campaign量${snapshot.size}-`);

    const campaignData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      ...doc.data().campaign,
    }));
    return campaignData;
  }

  async processData(airdrop: any) {
    const firestore = this.firestoreConfig.getFirestore();
    console.log('-开始处理数据-', airdrop.id);

    const MAX_QUERIES_PER_SECOND = 500; // 每秒最大查询数量
    const DELAY_BETWEEN_QUERIES = 1000 / MAX_QUERIES_PER_SECOND; // 每个查询之间的延迟时间

    const [participationsSnapshot, referralsSnapshot] = await Promise.all([
      firestore
        .collection(`airdrops/${airdrop.id}/airdropParticipations`)
        .get(),
      firestore.collection(`airdrops/${airdrop.id}/airdropReferrals`).get(),
    ]);

    const addressList = participationsSnapshot.docs.map((itemData) => ({
      wallet: itemData.data()?.wallet?.address.toLowerCase() || '',
      twitter: itemData.data()?.twitter?.username || '',
    }));

    const referralDataList = [];
    for (const itemData of referralsSnapshot.docs) {
      const data = itemData.data();
      const address = data.walletAddress
        ? data.walletAddress.toLowerCase()
        : '';
      const matchingItem =
        addressList.find((dataItem) => dataItem.wallet === address) ||
        ({} as any);
      let referralWallet = '';

      const pattern =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const trimmedString = data.referralCode?.replace(/\s/g, '');

      if (pattern.test(trimmedString)) {
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_QUERIES),
        ); // 添加延迟
        const referralCodesName = await firestore
          .collection(`referralCodes`)
          .doc(data.referralCode)
          .get();
        if (referralCodesName.exists) {
          const referralAddressData = await firestore
            .collection(`akiUsers`)
            .doc(referralCodesName.data().akiUserID)
            .get();
          referralWallet = referralAddressData.data()?.wallet?.address || '';
        }
      }

      referralDataList.push({
        Wallet: data.walletAddress,
        twitter: matchingItem.twitter || '',
        converted: data.converted,
        referralCode:
          data.referralCode !== 'undefined' ? data.referralCode : '',
        referralWallet,
      });
    }

    const existingAddressesMap = new Map();
    const filteredData = referralDataList.filter((item) => {
      if (existingAddressesMap.has(item.Wallet)) {
        const existingConverted = existingAddressesMap.get(item.Wallet);
        if (item.converted && !existingConverted) {
          existingAddressesMap.set(item.Wallet, item.converted);
        }
        return false;
      } else {
        existingAddressesMap.set(item.Wallet, item.converted);
        return true;
      }
    });

    const referralNumberMap = new Map();
    const completeData = filteredData.map((item: any) => {
      let referralNumber = 0;
      let convertedNumber = 0;

      filteredData.forEach((innerItem) => {
        if (
          innerItem.referralWallet &&
          innerItem.referralWallet !== '' &&
          innerItem.referralWallet === item.Wallet
        ) {
          referralNumber++;
          if (innerItem.converted) {
            convertedNumber++;
          }
        }
      });

      const convertedRate =
        referralNumber === 0 ? 0 : (convertedNumber / referralNumber) * 100;

      item.referralNumber = referralNumber;
      item.convertedNumber = convertedNumber;
      item.convertedRate = `${convertedRate.toFixed(2)}%`;
      referralNumberMap.set(item.Wallet, referralNumber);
      return item;
    });

    const joinCount = completeData.length;
    const convertedTrueCount = completeData.filter(
      (i: any) => i.converted,
    ).length;
    const referralCodeConvertedCount = completeData.filter(
      (item: any) => item.referralCode && item.converted === true,
    ).length;
    const convertedRate = new BigNumber(convertedTrueCount)
      .div(joinCount)
      .times(100)
      .toFixed(2);
    const referralCodeCount = completeData.filter(
      (i: any) => i.referralCode,
    ).length;
    console.log('-数据处理一个完成-', airdrop.id);

    return {
      airdopInfo: airdrop,
      referralInfo: completeData,
      Visitors: joinCount,
      Conversions: convertedTrueCount,
      ConversionRate: convertedRate === 'NaN' ? '0.00%' : `${convertedRate}%`,
      MicroInfluencers: 0,
      ReferredVisitors: referralCodeCount,
      ReferredConversions: referralCodeConvertedCount,
    };
  }

  async saveProcessedData(processedData: any) {
    console.log('-开始更新文档-');
    const updatePromises = [];
    const firestore = this.firestoreConfig.getFirestore();
    const collectionRef = firestore.collection('airdropsProcessedData');

    const { airdopInfo, ...restData } = processedData;

    const querySnapshot = await collectionRef
      .where('airdopInfo.id', '==', airdopInfo.id)
      .get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const docData = doc.data();

      const conversionsDiff = new BigNumber(restData.Conversions).minus(
        docData.Conversions,
      );
      const visitorsDiff = new BigNumber(restData.Visitors).minus(
        docData.Visitors,
      );

      const conversionsGrowthRate = conversionsDiff
        .dividedBy(docData.Conversions)
        .times(100)
        .toFixed(2);
      const visitorsGrowthRate = visitorsDiff
        .dividedBy(docData.Visitors)
        .times(100)
        .toFixed(2);

      const originalConversionRate = docData.ConversionRate;
      const newConversionRate = restData.ConversionRate;

      const originalConversionRateDecimal = new BigNumber(
        originalConversionRate.replace('%', ''),
      ).dividedBy(100);
      const newConversionRateDecimal = new BigNumber(
        newConversionRate.replace('%', ''),
      ).dividedBy(100);

      const conversionRateDiff = newConversionRateDecimal.minus(
        originalConversionRateDecimal,
      );

      const updatePromise = await doc.ref.update({
        ...restData,
        updateTime: new Date().toISOString(),
        conversionsGrowthRate: `${conversionsGrowthRate === 'NaN' ? '0.00' : conversionsGrowthRate}%`,
        visitorsGrowthRate: `${visitorsGrowthRate === 'NaN' ? '0.00' : visitorsGrowthRate}%`,
        conversionRateGrowthRate: `${conversionRateDiff.times(100).toFixed(2)}%`,
      });
      updatePromises.push(updatePromise);
    } else {
      const addPromise = await collectionRef.add({
        ...processedData,
        updateTime: new Date().toISOString(),
        conversionsGrowthRate: '0.00%',
        visitorsGrowthRate: '0.00%',
        conversionRateGrowthRate: '0.00%',
      });
      updatePromises.push(addPromise);
    }
    await Promise.all(updatePromises);
    console.log('单个 Firebase 文档处理完毕');
  }
}

// async saveProcessedData(processedData: any) {
//   console.log('-开始更新文档-');

//   const firestore = this.firestoreConfig.getFirestore();
//   const collectionRef = firestore.collection('airdropsProcessedData');
//   const updatePromises = [];

//   for (const dataObj of processedData) {
//     const { airdopInfo, ...restData } = dataObj;

//     const querySnapshot = await collectionRef
//       .where('airdopInfo.id', '==', airdopInfo.id)
//       .get();

//     if (!querySnapshot.empty) {
//       const doc = querySnapshot.docs[0];
//       const docData = doc.data();

//       const conversionsDiff = new BigNumber(restData.Conversions).minus(
//         docData.Conversions,
//       );
//       const visitorsDiff = new BigNumber(restData.Visitors).minus(
//         docData.Visitors,
//       );

//       const conversionsGrowthRate = conversionsDiff
//         .dividedBy(docData.Conversions)
//         .times(100)
//         .toFixed(2);
//       const visitorsGrowthRate = visitorsDiff
//         .dividedBy(docData.Visitors)
//         .times(100)
//         .toFixed(2);

//       const originalConversionRate = docData.ConversionRate;
//       const newConversionRate = restData.ConversionRate;

//       const originalConversionRateDecimal = new BigNumber(
//         originalConversionRate.replace('%', ''),
//       ).dividedBy(100);
//       const newConversionRateDecimal = new BigNumber(
//         newConversionRate.replace('%', ''),
//       ).dividedBy(100);

//       const conversionRateDiff = newConversionRateDecimal.minus(
//         originalConversionRateDecimal,
//       );

//       const updatePromise = await doc.ref.update({
//         ...restData,
//         updateTime: new Date().toISOString(),
//         conversionsGrowthRate: `${conversionsGrowthRate === 'NaN' ? '0.00' : conversionsGrowthRate}%`,
//         visitorsGrowthRate: `${visitorsGrowthRate === 'NaN' ? '0.00' : visitorsGrowthRate}%`,
//         conversionRateGrowthRate: `${conversionRateDiff.times(100).toFixed(2)}%`,
//       });
//       updatePromises.push(updatePromise);
//     } else {
//       const addPromise = await collectionRef.add({
//         ...dataObj,
//         updateTime: new Date().toISOString(),
//         conversionsGrowthRate: '0.00%',
//         visitorsGrowthRate: '0.00%',
//         conversionRateGrowthRate: '0.00%',
//       });
//       updatePromises.push(addPromise);
//     }
//   }
//   await Promise.all(updatePromises);
//   console.log('所有 Firebase 文档处理完毕');
// }
