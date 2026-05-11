export type Settings = {
  accountId: string;
  domainName: string;
  certificateArn: string;
};

export type RegionSettings = {
  [region: string]: Settings;
};

export type AccountStageRegionSettings = {
  [stage: string]: RegionSettings;
};

export type TimerServiceProps = {
  stage: string;
  region: string;
  accountSettings: Settings;
};
