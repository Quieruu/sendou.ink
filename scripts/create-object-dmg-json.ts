/* eslint-disable */
// @ts-nocheck

// 1) WeaponInfoMain.json inside dicts
// 2) WeaponInfoSub.json inside dicts
// 3) WeaponInfoSpecial.json inside dicts
// 4) misc/spl__DamageRateInfoConfig.pp__CombinationDataTableData.json
import params from "./dicts/spl__DamageRateInfoConfig.pp__CombinationDataTableData.json";
import weapons from "./dicts/WeaponInfoMain.json";
import subWeapons from "./dicts/WeaponInfoSub.json";
import specialWeapons from "./dicts/WeaponInfoSpecial.json";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR_PATH = path.join(__dirname, "output");

const weaponParamsToWeaponIds = (
  params: typeof weapons | typeof subWeapons | typeof specialWeapons,
  key: string
) => {
  return params
    .filter((param) => {
      return (
        param.DefaultDamageRateInfoRow === key ||
        param.ExtraDamageRateInfoRowSet?.some(
          (row) => row.DamageRateInfoRow === key
        )
      );
    })
    .map((weapon) => weapon.Id);
};

const result = {};
for (const cell of Object.values(params.CellList)) {
  if (!cell.DamageRate) continue;

  if (!result[cell.RowKey]) {
    result[cell.RowKey] = {
      mainWeaponIds: weaponParamsToWeaponIds(weapons, cell.RowKey),
      subWeaponIds: weaponParamsToWeaponIds(subWeapons, cell.RowKey),
      specialWeaponIds: weaponParamsToWeaponIds(specialWeapons, cell.RowKey),
      rates: [],
    };
  }

  result[cell.RowKey].rates.push({
    target: cell.ColumnKey,
    rate: cell.DamageRate,
  });
}

fs.writeFileSync(
  path.join(OUTPUT_DIR_PATH, "object-dmg.json"),
  JSON.stringify(result, null, 2)
);