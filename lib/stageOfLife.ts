// "Stage of Life" on the /welcome Connect form — helps the team understand who's coming
// through the door. One choice per guest.

export type StageOfLife = { value: string; label: string };

export const STAGE_OF_LIFE_OPTIONS: StageOfLife[] = [
  { value: 'young-adult', label: 'Young Adult / Twentysomethings' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];
