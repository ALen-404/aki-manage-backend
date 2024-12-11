
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface IMutation {
    verifySignature(address: string, signature: string): string | Promise<string>;
}

export interface IQuery {
    Airdrops(page?: Nullable<number>, pageSize?: Nullable<number>, id?: Nullable<string>, name?: Nullable<string>, start_date?: Nullable<string>, end_date?: Nullable<string>, is_active?: Nullable<string>): CampaignInfo[] | Promise<CampaignInfo[]>;
    getAddressLevel(): string | Promise<string>;
}

export interface Airdrop {
    id?: Nullable<string>;
    airdrop_id?: Nullable<string>;
    airdrop_type?: Nullable<string>;
    isOfficial?: Nullable<string>;
    listed?: Nullable<string>;
    owner_id?: Nullable<string>;
    participation_count?: Nullable<number>;
    reward_type?: Nullable<string>;
    series_image?: Nullable<string>;
    series_name?: Nullable<string>;
}

export interface CampaignInfo {
    airdrop_id?: Nullable<string>;
    airdrop_type?: Nullable<string>;
    title?: Nullable<string>;
    start_date?: Nullable<string>;
    end_date?: Nullable<string>;
    visitors?: Nullable<number>;
    conversions?: Nullable<number>;
    microInfluencers?: Nullable<number>;
    visitorsGrowth?: Nullable<string>;
    conversionRate?: Nullable<string>;
    conversionRateGrowthRate?: Nullable<string>;
    conversionIncrease?: Nullable<string>;
    referredVisitors?: Nullable<number>;
    referredConversions?: Nullable<number>;
    updateTime?: Nullable<string>;
    isOfficial?: Nullable<boolean>;
    listed?: Nullable<boolean>;
    referralInfo?: Nullable<Nullable<ReferralInfo>[]>;
    total?: Nullable<number>;
}

export interface ReferralInfo {
    wallet?: Nullable<string>;
    twitter?: Nullable<string>;
    converted?: Nullable<string>;
    referralCode?: Nullable<string>;
    referralWallet?: Nullable<string>;
    referralNumber?: Nullable<string>;
    convertedNumber?: Nullable<string>;
    convertedRate?: Nullable<string>;
}

export interface Airdrop_participation {
    id?: Nullable<string>;
    airdrop_id?: Nullable<string>;
    twitter?: Nullable<string>;
    questionnaire?: Nullable<string>;
    nft_reward_transaction?: Nullable<string>;
    wallet?: Nullable<string>;
    discord?: Nullable<string>;
    contract_interaction?: Nullable<string>;
    telegram?: Nullable<string>;
    electiveTasks?: Nullable<string>;
    aptos_wallet?: Nullable<string>;
    question_input_validations?: Nullable<string>;
    google_sheet_values_validations?: Nullable<string>;
}

export interface Airdrop_referral {
    id?: Nullable<string>;
    airdrop_id?: Nullable<string>;
    referralCode?: Nullable<string>;
    airdropTitle?: Nullable<string>;
    airdropID?: Nullable<string>;
    walletAddress?: Nullable<string>;
    converted?: Nullable<string>;
}

export interface Campaign {
    id?: Nullable<string>;
    airdrop_id?: Nullable<string>;
    cover_photo?: Nullable<string>;
    description?: Nullable<string>;
    end_date?: Nullable<string>;
    mode?: Nullable<string>;
    nft_photo?: Nullable<string>;
    nft_video?: Nullable<string>;
    parentLabel?: Nullable<string>;
    rewardDistribution?: Nullable<string>;
    start_date?: Nullable<string>;
    title?: Nullable<string>;
    token_chain?: Nullable<number>;
    token_contract_addr?: Nullable<string>;
    token_decimal?: Nullable<number>;
    token_quantity?: Nullable<number>;
    token_std?: Nullable<string>;
    token_symbol?: Nullable<string>;
    total_winners?: Nullable<number>;
}

export interface Envelope {
    id?: Nullable<string>;
    airdrop_id?: Nullable<string>;
    bitsetSize?: Nullable<string>;
    deposit_transaction_hash?: Nullable<string>;
    envelopes_left?: Nullable<string>;
    erc721_token_ids?: Nullable<string>;
}

export interface Grading_metrics {
    id?: Nullable<string>;
    campaign_id?: Nullable<string>;
    airdrop_id?: Nullable<string>;
    grading?: Nullable<number>;
    required?: Nullable<string>;
    rewardBoost?: Nullable<number>;
    task?: Nullable<string>;
    twitter_id_to_follow?: Nullable<string>;
    link_button_text?: Nullable<string>;
    link_description?: Nullable<string>;
    link_task_text?: Nullable<string>;
    share_link?: Nullable<string>;
    share_comment?: Nullable<string>;
}

export interface Information {
    id?: Nullable<string>;
    airdrop_id?: Nullable<string>;
    description?: Nullable<string>;
    image_url?: Nullable<string>;
    projectNews?: Nullable<string>;
    title?: Nullable<string>;
    web?: Nullable<string>;
}

export interface Participation_count {
    id?: Nullable<string>;
    airdrop_id?: Nullable<string>;
    timestamp?: Nullable<string>;
    count?: Nullable<number>;
}

export type Upload = any;
type Nullable<T> = T | null;
