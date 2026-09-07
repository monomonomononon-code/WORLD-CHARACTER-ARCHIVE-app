/* ============ app state ============ */
let worlds = [];
let characters = [];
let currentTab = 'world';
let openWorldId = null;    // detail view target
let openCharId = null;
let editingWorldId = null; // null = new
let editingCharId = null;
let relDraft = [];         // relationships being edited in modal

/* ============ field definitions ============ */
const CHAR_BOXES = [
  { title:'基本情報', fields:[
      ['name','氏名','input'], ['furigana','ふりがな','input'], ['gender','性別','input'], ['age','年齢','input'], ['affiliation','所属','input']
  ]},
  { title:'性格', fields:[
      ['mbti','MBTIタイプ','input'], ['enneagram','エニアグラムタイプ','input'], ['typeName','タイプ名','input'],
      ['personality','性格','textarea'], ['principle','行動原理','textarea']
  ]},
  { title:'話し方', fields:[
      ['tone','口調','input'], ['ending1','語尾①','input'], ['ending2','語尾②','input'],
      ['firstPerson','一人称','input'], ['secondPerson','二人称','input']
  ]},
  { title:'外見', fields:[
      ['appearance','外見','textarea'], ['outfit','服装','textarea'], ['features','特徴','textarea']
  ]},
  { title:'趣味', fields:[
      ['hobby','趣味','textarea']
  ]},
  { title:'異能', fields:[
      ['abilityName','異能名','input'], ['abilityDetail','異能詳細','textarea']
  ]},
];

function emptyChar(){
  const c = { id: crypto.randomUUID(), relationships: [] };
  CHAR_BOXES.forEach(b => b.fields.forEach(([key]) => c[key] = ''));
  return c;
}
