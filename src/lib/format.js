export const money = value => '$' + Number(value || 0).toLocaleString('en-US');
