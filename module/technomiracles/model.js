/**
 * Тип предмета «Техночудо».
 *
 * Объявлен в module.json под `documentTypes` — это собственный способ Foundry
 * дать модулю добавить под-тип документа; систему impmal здесь ничто не правит.
 * Тем же механизмом уже пользуются Виды.
 *
 * Модель НАСЛЕДУЕТ модель оружия impmal, а не собирает свою рядом.
 *
 * План предполагал взять у оружия только классы урона и черт и встроить их в
 * собственную модель. Живая проба показала, что этого мало:
 * `setupWeaponTest` падает с `weapon.system.hasAmmo is not a function`, потому
 * что читает с оружия не поля, а МЕТОДЫ — `hasAmmo()` и геттер `skill`, — а их
 * инертными полями не добавишь. Дописывать их к себе значило бы переписать
 * половину модели оружия и обречь копию разъехаться с оригиналом.
 *
 * Наследование даёт всё разом: урон, черты, тип атаки, полосу дальности,
 * `skill`, `isMelee`/`isRanged`, расчёт урона и весь путь атаки. Это тот же
 * принцип, который спека и провозглашает, — «переиспользовать, а не
 * имитировать», — только применённый ко всей поверхности атаки, а не к двум
 * полям.
 *
 * Цена наследования — несколько чужих полей (количество, слоты снаряжения,
 * доступность). Они остаются со значениями по умолчанию и никому не мешают;
 * план и сам предлагал добавить такие «инертные» поля, просто вручную.
 *
 * Класс собирается внутри функции: модель оружия появляется в CONFIG только
 * после того, как система вычислится.
 */

export const TECHNOMIRACLE_TYPE = "navis-apexialis.technomiracle";

const MODULE_ID = "navis-apexialis";

let TechnoMiracleModel = null;

/** Модель оружия impmal — либо null и внятная жалоба. */
function weaponModel() {
  const weapon = CONFIG.Item.dataModels?.weapon;

  if (typeof weapon !== "function") {
    console.error(
      `${MODULE_ID} | impmal no longer registers a weapon data model at CONFIG.Item.dataModels.weapon, `
      + "which the Techno-miracle model extends. Techno-miracles cannot be registered."
    );
    return null;
  }

  return weapon;
}

export function defineTechnoMiracleModel() {
  if (TechnoMiracleModel) return TechnoMiracleModel;

  const WeaponModel = weaponModel();
  if (!WeaponModel) return null;

  const fields = foundry.data.fields;

  TechnoMiracleModel = class TechnoMiracleModel extends WeaponModel {
    static defineSchema() {
      const schema = super.defineSchema();

      schema.notes = new fields.SchemaField({
        player: new fields.HTMLField(),
        gm: new fields.HTMLField()
      });

      schema.school = new fields.StringField();
      schema.path = new fields.StringField();
      schema.xp = new fields.NumberField({ initial: 0, min: 0, integer: true });

      // Та же форма, что у талантов impmal: читаемый текст плюс необязательная
      // проверка. Лист показывает, выполнено ли требование, но ничего не
      // запрещает — решает ведущий.
      schema.requirement = new fields.SchemaField({
        value: new fields.StringField(),
        script: new fields.JavaScriptField()
      });

      // Названия имплантов из пака аугметики. Поле совещательное: оно
      // предупреждает, но не блокирует.
      schema.hardware = new fields.ArrayField(new fields.StringField());

      // Число — либо строка «X», когда жрец сам решает, сколько влить. Потому
      // строковое поле, а не числовое.
      const costField = () => new fields.StringField({ initial: "0" });
      schema.cost = new fields.SchemaField({ cognition: costField(), energy: costField() });

      schema.action = new fields.StringField({ initial: "free" });

      schema.process = new fields.SchemaField({
        sustains: new fields.BooleanField({ initial: false }),
        cognition: new fields.NumberField({ initial: 0, min: 0, max: 1, integer: true }),
        unique: new fields.BooleanField({ initial: false })
      });

      schema.test = new fields.SchemaField({
        auto: new fields.BooleanField({ initial: false }),
        modifier: new fields.NumberField({ initial: 0, integer: true })
      });

      // Не `range`: у модели оружия это полоса дальности (short/medium/long), и
      // её читает computeRange(). Наше понятие — куда чудо дотягивается — живёт
      // отдельным полем, а атакующее чудо пользуется полосой оружия как есть.
      schema.reach = new fields.SchemaField({
        kind: new fields.StringField({ initial: "self" }),
        value: new fields.StringField()
      });

      schema.types = new fields.SchemaField({
        doctrine: new fields.BooleanField(),
        passive: new fields.BooleanField(),
        reactive: new fields.BooleanField(),
        unseen: new fields.BooleanField(),
        anima: new fields.BooleanField()
      });

      // damage, traits, attackType, range и mag достались от модели оружия.
      // Здесь только уточняем: по умолчанию чудо не атакует.
      schema.attackType = new fields.StringField({ initial: "none" }); // none | melee | ranged

      // Пробивания отдельным полем НЕТ намеренно: в impmal это черта оружия
      // `penetrating` со значением, и её читает боевой расчёт. Своё число было
      // бы мёртвыми данными, которых никто не смотрит.

      // Уклоняющийся должен сравняться со жрецом по КУ, а не просто пройти
      // проверку. У impmal такого нет, поэтому это наше поле, а не черта.
      schema.opposedDodge = new fields.BooleanField();

      return schema;
    }

    get attacks() {
      return this.isMelee || this.isRanged;
    }

    /**
     * Не атакующему чуду нечего готовить по-оружейному.
     *
     * `computeOwned` у оружия заканчивается строкой
     * `actor.system.skills[this.skill].total`, а `getSkill` возвращает
     * `attackType`. При «none» такого умения нет, и подготовка данных падала —
     * вместе с ней валилась подготовка всего актёра. Для не атакующего чуда
     * весь этот расчёт бессмыслен, поэтому его просто не надо звать.
     */
    computeOwned(actor) {
      if (!this.attacks) return;
      super.computeOwned(actor);
    }

    /**
     * Чудо питается Зарядом, а не патронами.
     *
     * У оружия hasAmmo() для дальней атаки смотрит в магазин, и без этой
     * подмены WeaponTest отказал бы любому дальнобойному чуду с «Не хватает
     * боеприпасов». Расход же берёт на себя цикл активации.
     */
    hasAmmo() {
      return true;
    }
  };

  return TechnoMiracleModel;
}
