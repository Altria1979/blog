# 动画清单审计（2006–2025）

审计日期：2026-10-11（Asia/Shanghai）。这是维护者整理的选集，不是完整动画数据库，也不是全球人气排行。2026 年是单独核验的进行中年度，不属于本文件的历史统计。

## 来源与范围

- 基础是 [egoist/anime-sedai](https://github.com/egoist/anime-sedai) 的固定提交 [b31f0641b59ea5840d358e9d465e842e3d124ff6](https://github.com/egoist/anime-sedai/commit/b31f0641b59ea5840d358e9d465e842e3d124ff6)。上游 `anime-data.ts` 含 334 条，界面每年只取前 12 条，实际展示 239 条（2009 年为 11 条）。本次保留这 239 个作品及稳定 ID，不再保留每年 12 条的显示限制。
- 上游许可为 MIT，版权为 `Copyright (c) 2025 EGOIST <hi@egoist.dev>`；完整许可证保存在项目第三方许可文件中。上游 `init-data.ts` 使用 Bangumi 的 TV 年度列表抓取标题和评分；本项目没有运行该抓取脚本，也不把旧评分作为当前评分展示。
- 逐年检查了 2006–2025 的 Bangumi 日本 TV 候选和 WEB 候选，以及全部 95 个被上游界面截去的条目。最终历史清单为 **453 条：239 个基础作品 + 214 个新增作品**；95 个截断项中恢复 **84 个**，其余 11 个逐年列明。
- 本次范围是日本制作的 TV / WEB 动画系列；续作按独立正式季保留。电影、OVA、单集特别篇、重编集不新增。同一正式季的上下半季度、Part 2、分批上线不重复计数，跨年时归到该季首次正式连续放送 / 上线的年份。原始 239 个作品按兼容约定保留。

## 可复查的筛选方式

1. 使用 [Bangumi 官方公开 API 定义](https://github.com/bangumi/api/blob/master/open-api/v0.yaml) 的 `POST /v0/search/subjects`，`type: [2]`，`meta_tags: ["日本", "TV"]`（另查 `WEB`），每个自然年设置 `air_date` 范围，`sort: "heat"`，`limit: 20`。该 API 的 heat 指 Bangumi 站内收藏人数，不表示全球排名。
2. 对上游 95 个截断项逐一按名称搜索，核对 `name`、`name_cn`、`date`、`platform`、`eps` 与条目 ID；没有把搜索第一个结果直接当作目标作品。
3. 新增候选通常要求审计时 Bangumi 评分人数至少 **4,000**，或五类收藏合计至少 **10,000**。这是控制本次补全范围的人工门槛，不是作品质量评分；作品还须满足系列类型与去重条件。唯一关注度门槛例外是《黑色五叶草》：[动画官方网站](https://bclover.jp/) 在简介中明确介绍 TV 动画曾在 87 个国家和地区获得观看量第一；它在 Bangumi 的较低参与人数不能代表其他地区。
4. 中文与日文使用 Bangumi 条目名，英文逐项比对 AniList 的 `title.english`，缺少英文名时使用其已有 `title.romaji`。下表同时提供 Bangumi 原始条目和 AniList 名称参考；未自行编造直译标题。别名、标点和地区译名可能存在差异，不宣称每一译名都是全球统一的官方名称。
5. 下表人数是本次读取的快照，收藏合计为 `wish + collect + doing + on_hold + dropped`。清单只保存 ID、年份、三语标题及来源 URL；这些人数不参与网站运行时筛选，访客也不会请求这些第三方 API。

## 年份、分季及译名处理

- [《石之海》官方发布通知](https://jojo-portal.com/anime/so/news/2/) 区分 2021-12-01 Netflix 首批上线与 2022-01-07 日本电视首播，因此本表归入 **2021**，不是 Bangumi TV 分类的 2022；后续批次不另列。
- [Aniplex《卫宫家今天的饭》发布通知](https://www.aniplex.co.jp/lineup/emiya-gohan/news/detail/?id=45916) 区分 2017 跨年特别节目先行播出与 2018 年正式配信，因此本表归入 **2018**。
- [《赛博朋克：边缘行者》官方网站](https://www.cyberpunk.net/en/edgerunners) 明确为日本 TRIGGER 参与制作的 10 集系列，可纳入 WEB 范围。
- 历史候选中没有重复加入《Fate/strange Fake》的 2023 单集特别篇或 2024 第一集先行版；2026 正式季由新年度清单处理。

合并到已有正式季、不新增独立勾选项的 10 个分割条目：

- [113292](https://bgm.tv/subject/113292)：2014 年《JOJO 星尘斗士》的后半篇。
- [109386](https://bgm.tv/subject/109386)：2014 年《Fate/stay night [Unlimited Blade Works]》的后半季度。
- [263750](https://bgm.tv/subject/263750)：2018 年《进击的巨人 第三季》的后半部分。
- [292238](https://bgm.tv/subject/292238)：2019 年《刀剑神域 爱丽丝篇 异界战争》的后半部分。
- [316247](https://bgm.tv/subject/316247)：2020 年《Re:Zero 第二季》的后半部分。
- [331887](https://bgm.tv/subject/331887)：2021 年《86》的后半部分。
- [325585](https://bgm.tv/subject/325585)：2021 年《无职转生》的后半部分。
- [373267](https://bgm.tv/subject/373267)：2022 年《间谍过家家》的后半部分。
- [444557](https://bgm.tv/subject/444557)：2023 年《无职转生 第二季》的后半部分。
- [331752](https://bgm.tv/subject/331752)：2020 年《进击的巨人 最终季》的后半部分。

《藤本树17-26》在 [Bangumi](https://bgm.tv/subject/582501) 与 [AniList](https://anilist.co/anime/198188) 的 WEB / MOVIE 标记不同，暂不加入，避免把短篇电影集混入本次系列范围。

保留原作品 ID 时修正了以下明确的名称问题：

| ID | 修正 | 依据 |
| --- | --- | --- |
| `anime-2019-007` | 补齐截断的英文标题：Cautious Hero: The Hero Is Overpowered but Overly Cautious | [Bangumi](https://bgm.tv/subject/266157) |
| `anime-2019-008` | 修复误指向 Angels’ 3Piece! 的英文名：Wataten! An Angel Flew Down to Me | [Bangumi](https://bgm.tv/subject/249637) |
| `anime-2023-008` | 使用官方日文标题，移除不存在的“地平線”副标题：ポケットモンスター | [Bangumi](https://bgm.tv/subject/411247) |
| `anime-2024-011` | 补齐日文正式标题的“チ。”：チ。 ―地球の運動について― | [Bangumi](https://bgm.tv/subject/389156) |

新增条目的名称也未盲从上游错误字段，例如《黄金拼图》采用 **KINMOZA!** / Kiniro Mosaic 而不是 Golden Time，《凭物语》采用 **Tsukimonogatari** 而不是 Owarimonogatari，《来玩游戏吧》采用 **Asobi Asobase** 而不是 Gamers!，《家有女友》采用 **Domestic Girlfriend** 而不是 Kanojo, Okarishimasu，《相合之物》采用 **Deaimon** 而不是 Sasaki and Miyano。对应条目链接见逐年表。

## 逐年新增及证据

### 2006：保留 12，新增 5，合计 17

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [樱兰高校男公关部](https://bgm.tv/subject/1487) | 5,849 | 11,811 | [Ouran High School Host Club](https://anilist.co/anime/853) |
| [监狱兔 第一季](https://bgm.tv/subject/1373) | 4,729 | 8,751 | [Usavich](https://anilist.co/anime/3737) |
| [蜂蜜与四叶草II](https://bgm.tv/subject/848) | 4,525 | 11,110 | [Honey and Clover II](https://anilist.co/anime/1142) |
| [黑礁 The Second Barrage](https://bgm.tv/subject/980) | 5,146 | 11,248 | [Black Lagoon: The Second Barrage](https://anilist.co/anime/1519) |
| [家庭教师HITMAN REBORN!](https://bgm.tv/subject/4562) | 4,393 | 10,239 | [REBORN!](https://anilist.co/anime/1604) |

该年上游截断项已全部核验并恢复。

### 2007：保留 12，新增 9，合计 21

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [濑户的花嫁](https://bgm.tv/subject/805) | 5,456 | 13,987 | [My Bride is a Mermaid](https://anilist.co/anime/2104) |
| [大剑](https://bgm.tv/subject/982) | 4,029 | 10,502 | [Claymore](https://anilist.co/anime/1818) |
| [DARKER THAN BLACK -黑之契约者-](https://bgm.tv/subject/292) | 10,081 | 22,756 | [Darker than Black](https://anilist.co/anime/2025) |
| [sola](https://bgm.tv/subject/798) | 4,205 | 10,041 | [sola](https://anilist.co/anime/1965) |
| [电脑线圈](https://bgm.tv/subject/794) | 4,875 | 15,000 | [Den-noh Coil](https://anilist.co/anime/2164) |
| [寒蝉鸣泣之时 解](https://bgm.tv/subject/288) | 13,237 | 26,346 | [When They Cry Kai](https://anilist.co/anime/1889) |
| [零之使魔 双月骑士](https://bgm.tv/subject/1103) | 6,124 | 12,259 | [The Familiar of Zero: Knight of the Twin Moons](https://anilist.co/anime/1840) |
| [物怪](https://bgm.tv/subject/2496) | 4,334 | 10,961 | [Mononoke](https://anilist.co/anime/2246) |
| [灼眼的夏娜II](https://bgm.tv/subject/491) | 6,508 | 13,343 | [Shakugan no Shana: Season II](https://anilist.co/anime/2787) |

上游截断项中本次未加入：[向阳素描](https://bgm.tv/subject/896)（评分 2,149 人，收藏合计 6,863，未达本次关注度门槛）。

### 2008：保留 12，新增 7，合计 19

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [水星领航员 第三季](https://bgm.tv/subject/1270) | 2,974 | 10,078 | [ARIA The ORIGINATION](https://anilist.co/anime/3297) |
| [Code Geass 反叛的鲁路修R2](https://bgm.tv/subject/8) | 18,910 | 33,427 | [Code Geass: Lelouch of the Rebellion R2](https://anilist.co/anime/2904) |
| [零之使魔 三美姬的轮舞](https://bgm.tv/subject/763) | 5,070 | 10,468 | [The Familiar of Zero: "Rondo" of Princesses](https://anilist.co/anime/3712) |
| [CLANNAD 〜AFTER STORY〜](https://bgm.tv/subject/876) | 31,895 | 60,422 | [Clannad: After Story](https://anilist.co/anime/4181) |
| [食灵-零-](https://bgm.tv/subject/885) | 4,945 | 10,813 | [Ga-Rei-Zero](https://anilist.co/anime/4725) |
| [机动战士高达00 第二季](https://bgm.tv/subject/1010) | 5,630 | 9,891 | [Mobile Suit Gundam 00 Second Season](https://anilist.co/anime/3927) |
| [悠久之翼2](https://bgm.tv/subject/1029) | 6,085 | 13,821 | [ef ~ A Tale of Melodies](https://anilist.co/anime/4789) |

上游截断项中本次未加入：[强袭魔女](https://bgm.tv/subject/698)（评分 2,729 人，收藏合计 7,892，未达本次关注度门槛）。

### 2009：保留 11，新增 4，合计 15

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [续 夏目友人帐](https://bgm.tv/subject/891) | 8,075 | 16,454 | [Natsume's Book of Friends Season 2](https://anilist.co/anime/5300) |
| [东之伊甸](https://bgm.tv/subject/1451) | 5,262 | 11,060 | [Eden of the East](https://anilist.co/anime/5630) |
| [狼与香辛料 第二季](https://bgm.tv/subject/1512) | 8,567 | 18,796 | [Spice and Wolf II](https://anilist.co/anime/5341) |
| [DARKER THAN BLACK -流星的双子-](https://bgm.tv/subject/2354) | 5,896 | 11,220 | [Darker than Black: Gemini of the Meteor](https://anilist.co/anime/6573) |

上游该年没有被截断的候选；新增来自逐年元数据复核。

### 2010：保留 12，新增 8，合计 20

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [会长是女仆大人！](https://bgm.tv/subject/4313) | 5,898 | 13,504 | [Maid-Sama!](https://anilist.co/anime/7054) |
| [荒川爆笑团](https://bgm.tv/subject/2464) | 8,407 | 18,600 | [Arakawa Under the Bridge](https://anilist.co/anime/7647) |
| [迷糊餐厅](https://bgm.tv/subject/4255) | 7,198 | 16,175 | [Wagnaria!!](https://anilist.co/anime/6956) |
| [轻音少女 第二季](https://bgm.tv/subject/3774) | 25,351 | 50,535 | [K-ON! Season 2](https://anilist.co/anime/7791) |
| [学园默示录 HIGHSCHOOL OF THE DEAD](https://bgm.tv/subject/5647) | 7,682 | 16,449 | [High School of the Dead](https://anilist.co/anime/8074) |
| [天降之物f](https://bgm.tv/subject/7150) | 6,824 | 15,256 | [Heaven's Lost Property: Forte](https://anilist.co/anime/8407) |
| [爆漫王。](https://bgm.tv/subject/3428) | 7,238 | 16,369 | [Bakuman.](https://anilist.co/anime/7674) |
| [魔法禁书目录 第二季](https://bgm.tv/subject/7843) | 12,855 | 25,652 | [A Certain Magical Index II](https://anilist.co/anime/8937) |

上游截断项中本次未加入：[圣痕炼金士](https://bgm.tv/subject/3479)（评分 2,579 人，收藏合计 7,616，未达本次关注度门槛）；[空之音](https://bgm.tv/subject/3477)（评分 2,118 人，收藏合计 5,354，未达本次关注度门槛）。

### 2011：保留 12，新增 13，合计 25

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [这个是僵尸吗？](https://bgm.tv/subject/9774) | 7,743 | 17,027 | [Is this a Zombie?](https://anilist.co/anime/8841) |
| [银魂'](https://bgm.tv/subject/11834) | 13,810 | 29,877 | [Gintama Season 2](https://anilist.co/anime/9969) |
| [赌博默示录 破戒录篇](https://bgm.tv/subject/12317) | 4,795 | 9,805 | [Kaiji - Against All Rules](https://anilist.co/anime/10271) |
| [绯弹的亚里亚](https://bgm.tv/subject/10226) | 7,334 | 15,686 | [Aria the Scarlet Ammo](https://anilist.co/anime/8630) |
| [电波女与青春男](https://bgm.tv/subject/10377) | 9,596 | 22,496 | [Ground Control to Psychoelectric Girl](https://anilist.co/anime/9379) |
| [神的记事本](https://bgm.tv/subject/15237) | 6,294 | 14,955 | [Heaven's Memo Pad](https://anilist.co/anime/10568) |
| [夏目友人帐 叁](https://bgm.tv/subject/12536) | 9,212 | 19,336 | [Natsume's Book of Friends Season 3](https://anilist.co/anime/10379) |
| [迷茫管家与懦弱的我](https://bgm.tv/subject/10459) | 5,994 | 13,179 | [Mayo Chiki!](https://anilist.co/anime/10110) |
| [白兔糖](https://bgm.tv/subject/10843) | 8,753 | 18,579 | [Bunny Drop](https://anilist.co/anime/10162) |
| [笨蛋，测验，召唤兽2！](https://bgm.tv/subject/11145) | 11,548 | 23,587 | [Baka and Test - Summon the Beasts 2](https://anilist.co/anime/8516) |
| [丹特丽安的书架](https://bgm.tv/subject/14667) | 5,355 | 13,366 | [The Mystic Archives of Dantalian](https://anilist.co/anime/8915) |
| [猎人](https://bgm.tv/subject/21032) | 6,670 | 15,533 | [Hunter x Hunter (2011)](https://anilist.co/anime/11061) |
| [未来日记](https://bgm.tv/subject/16235) | 15,700 | 32,531 | [The Future Diary](https://anilist.co/anime/10620) |

上游截断项中本次未加入：[纯白交响曲](https://bgm.tv/subject/12557)（评分 3,129 人，收藏合计 7,640，未达本次关注度门槛）；[BLOOD-C](https://bgm.tv/subject/14427)（评分 3,343 人，收藏合计 8,474，未达本次关注度门槛）。

### 2012：保留 12，新增 11，合计 23

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [散华礼弥](https://bgm.tv/subject/28230) | 10,105 | 22,910 | [Sankarea: Undying Love](https://anilist.co/anime/11499) |
| [加速世界](https://bgm.tv/subject/23685) | 8,773 | 17,970 | [Accel World](https://anilist.co/anime/11759) |
| [潜行吧！奈亚子](https://bgm.tv/subject/24508) | 9,034 | 21,445 | [Nyaruko: Crawling with Love!](https://anilist.co/anime/11785) |
| [TARI TARI](https://bgm.tv/subject/37137) | 6,420 | 15,351 | [Tari Tari](https://anilist.co/anime/13333) |
| [摇曳百合♪♪](https://bgm.tv/subject/28900) | 7,731 | 17,360 | [YuruYuri Season 2](https://anilist.co/anime/12403) |
| [恋爱随意链接](https://bgm.tv/subject/37154) | 8,201 | 18,335 | [Kokoro Connect](https://anilist.co/anime/11887) |
| [邻座的怪同学](https://bgm.tv/subject/40533) | 9,249 | 20,394 | [My Little Monster](https://anilist.co/anime/14227) |
| [就算是哥哥只要有爱就没问题对吧](https://bgm.tv/subject/40339) | 4,731 | 12,312 | [OniAi](https://anilist.co/anime/14199) |
| [Little Busters!](https://bgm.tv/subject/38040) | 6,107 | 16,385 | [Little Busters!](https://anilist.co/anime/13655) |
| [少女与战车](https://bgm.tv/subject/40310) | 8,395 | 18,574 | [Girls und Panzer](https://anilist.co/anime/14131) |
| [猫物语（黑）](https://bgm.tv/subject/56117) | 11,420 | 22,615 | [Nekomonogatari Black](https://anilist.co/anime/15689) |

上游截断项中本次未加入：[谜样女友X](https://bgm.tv/subject/29323)（评分 2,410 人，收藏合计 6,565，未达本次关注度门槛）。

### 2013：保留 12，新增 15，合计 27

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [我女友与青梅竹马的惨烈修罗场](https://bgm.tv/subject/43557) | 8,936 | 19,488 | [Oreshura](https://anilist.co/anime/14749) |
| [Love Live!](https://bgm.tv/subject/49294) | 10,380 | 21,109 | [Love Live! School Idol Project](https://anilist.co/anime/15051) |
| [GJ部](https://bgm.tv/subject/48031) | 4,806 | 12,627 | [GJ Club](https://anilist.co/anime/14811) |
| [我的朋友很少NEXT](https://bgm.tv/subject/46011) | 7,225 | 14,732 | [Haganai NEXT](https://anilist.co/anime/14967) |
| [打工吧！魔王大人](https://bgm.tv/subject/50814) | 12,921 | 25,783 | [The Devil is a Part-Timer!](https://anilist.co/anime/15809) |
| [某科学的超电磁炮S](https://bgm.tv/subject/51928) | 18,350 | 37,507 | [A Certain Scientific Railgun S](https://anilist.co/anime/16049) |
| [变态王子与不笑猫。](https://bgm.tv/subject/45842) | 10,337 | 22,947 | [Hentai Prince & the Stony Cat](https://anilist.co/anime/15225) |
| [弹丸论破 希望学园与绝望高中生](https://bgm.tv/subject/56093) | 10,184 | 19,871 | [Danganronpa: The Animation](https://anilist.co/anime/16592) |
| [黄金拼图](https://bgm.tv/subject/57978) | 4,504 | 11,195 | [KINMOZA!](https://anilist.co/anime/16732) |
| [物语系列 第二季](https://bgm.tv/subject/68812) | 13,487 | 28,021 | [Monogatari Series Second Season](https://anilist.co/anime/17074) |
| [Fate/kaleid liner 魔法少女☆伊莉雅](https://bgm.tv/subject/43951) | 6,284 | 15,106 | [Fate/kaleid liner Prisma☆Illya](https://anilist.co/anime/14829) |
| [记录的地平线](https://bgm.tv/subject/64140) | 7,016 | 16,604 | [Log Horizon](https://anilist.co/anime/17265) |
| [白色相簿2](https://bgm.tv/subject/69496) | 9,670 | 21,135 | [White Album 2](https://anilist.co/anime/18245) |
| [机巧少女不会受伤](https://bgm.tv/subject/61962) | 7,332 | 16,584 | [Unbreakable Machine-Doll](https://anilist.co/anime/17247) |
| [我的脑内选项正在全力妨碍学园恋爱喜剧](https://bgm.tv/subject/77570) | 6,697 | 14,714 | [My Mental Choices Are Completely Interfering With My School Romantic Comedy](https://anilist.co/anime/19221) |

该年上游截断项已全部核验并恢复。

### 2014：保留 12，新增 14，合计 26

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [妄想学生会＊](https://bgm.tv/subject/85204) | 8,535 | 19,093 | [Seitokai Yakuindomo Season 2](https://anilist.co/anime/20448) |
| [野良神](https://bgm.tv/subject/82572) | 12,567 | 27,016 | [Noragami](https://anilist.co/anime/20447) |
| [中二病也要谈恋爱！恋](https://bgm.tv/subject/72942) | 16,713 | 35,433 | [Love, Chunibyo & Other Delusions - Heart Throb -](https://anilist.co/anime/18671) |
| [农林](https://bgm.tv/subject/68756) | 5,437 | 12,916 | [No-Rin](https://anilist.co/anime/18095) |
| [JOJO的奇妙冒险 星尘斗士](https://bgm.tv/subject/85631) | 18,216 | 36,485 | [JoJo's Bizarre Adventure: Stardust Crusaders](https://anilist.co/anime/20474) |
| [魔法科高校的劣等生](https://bgm.tv/subject/84872) | 7,209 | 15,600 | [The Irregular at Magic High School](https://anilist.co/anime/20458) |
| [排球少年](https://bgm.tv/subject/84171) | 9,534 | 20,350 | [HAIKYU!!](https://anilist.co/anime/20464) |
| [漆黑的子弹](https://bgm.tv/subject/84873) | 7,773 | 17,645 | [Black Bullet](https://anilist.co/anime/20457) |
| [约会大作战 第二季](https://bgm.tv/subject/76325) | 10,386 | 22,073 | [Date A Live II](https://anilist.co/anime/19163) |
| [东京喰种](https://bgm.tv/subject/93714) | 14,536 | 30,079 | [Tokyo Ghoul](https://anilist.co/anime/20605) |
| [刀剑神域 第二季](https://bgm.tv/subject/92382) | 14,817 | 29,845 | [Sword Art Online II](https://anilist.co/anime/20594) |
| [花物语](https://bgm.tv/subject/82322) | 7,759 | 16,731 | [Hanamonogatari](https://anilist.co/anime/20593) |
| [灰色的果实](https://bgm.tv/subject/67376) | 5,812 | 15,052 | [The Fruit of Grisaia](https://anilist.co/anime/17729) |
| [凭物语](https://bgm.tv/subject/115932) | 8,174 | 17,079 | [Tsukimonogatari](https://anilist.co/anime/20918) |

该年上游截断项已全部核验并恢复。

### 2015：保留 12，新增 8，合计 20

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [我的青春恋爱物语果然有问题 续](https://bgm.tv/subject/102134) | 19,650 | 39,041 | [My Teen Romantic Comedy SNAFU TOO!](https://anilist.co/anime/20698) |
| [食戟之灵](https://bgm.tv/subject/116461) | 9,268 | 19,639 | [Food Wars!](https://anilist.co/anime/20923) |
| [血界战线](https://bgm.tv/subject/105075) | 9,825 | 22,775 | [Blood Blockade Battlefront](https://anilist.co/anime/20727) |
| [伪恋：](https://bgm.tv/subject/114758) | 8,689 | 19,411 | [Nisekoi:](https://anilist.co/anime/20876) |
| [没有黄段子存在的无聊世界](https://bgm.tv/subject/115780) | 9,246 | 20,761 | [SHIMONETA: A Boring World Where the Concept of Dirty Jokes Doesn’t Exist](https://anilist.co/anime/20910) |
| [学园孤岛](https://bgm.tv/subject/106693) | 9,475 | 21,914 | [SCHOOL-LIVE!](https://anilist.co/anime/20754) |
| [落第骑士英雄谭](https://bgm.tv/subject/127724) | 7,719 | 17,125 | [Chivalry of a Failed Knight](https://anilist.co/anime/21092) |
| [请问您今天要来点兔子吗？？](https://bgm.tv/subject/123568) | 8,514 | 19,892 | [Is the Order a Rabbit?? Season 2](https://anilist.co/anime/21034) |

上游截断项中本次未加入：[旋转少女](https://bgm.tv/subject/110600)（评分 2,799 人，收藏合计 8,094，未达本次关注度门槛）。

### 2016：保留 12，新增 12，合计 24

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [无彩限的怪灵世界](https://bgm.tv/subject/94040) | 5,635 | 13,438 | [Myriad Colors Phantom World](https://anilist.co/anime/21306) |
| [暗杀教室 第二季](https://bgm.tv/subject/131891) | 8,328 | 17,984 | [Assassination Classroom Second Season](https://anilist.co/anime/21170) |
| [昭和元禄落语心中](https://bgm.tv/subject/119394) | 3,880 | 11,487 | [Showa Genroku Rakugo Shinju](https://anilist.co/anime/20972) |
| [亚人](https://bgm.tv/subject/146093) | 6,597 | 14,633 | [AJIN: Demi-Human](https://anilist.co/anime/21341) |
| [JOJO的奇妙冒险 不灭钻石](https://bgm.tv/subject/150490) | 15,918 | 32,392 | [JoJo's Bizarre Adventure: Diamond is Unbreakable](https://anilist.co/anime/21450) |
| [我的英雄学院](https://bgm.tv/subject/150955) | 7,607 | 14,564 | [My Hero Academia](https://anilist.co/anime/21459) |
| [文豪野犬](https://bgm.tv/subject/144357) | 5,609 | 14,013 | [Bungo Stray Dogs](https://anilist.co/anime/21311) |
| [甲铁城的卡巴内利](https://bgm.tv/subject/118781) | 10,855 | 20,931 | [Kabaneri of the Iron Fortress](https://anilist.co/anime/21196) |
| [线上游戏的老婆不可能是女生？](https://bgm.tv/subject/142758) | 8,170 | 18,044 | [And you thought there is never a girl online?](https://anilist.co/anime/21290) |
| [在下坂本，有何贵干？](https://bgm.tv/subject/165829) | 14,295 | 29,345 | [Haven't You Heard? I'm Sakamoto](https://anilist.co/anime/21595) |
| [星之梦](https://bgm.tv/subject/176518) | 5,773 | 12,368 | [Planetarian](https://anilist.co/anime/21732) |
| [吹响吧！上低音号 第二季](https://bgm.tv/subject/152091) | 18,230 | 33,826 | [Sound! Euphonium 2](https://anilist.co/anime/21460) |

上游截断项中本次未加入：[剑风传奇](https://bgm.tv/subject/162040)（评分 1,721 人，收藏合计 4,430，未达本次关注度门槛）。

### 2017：保留 12，新增 14，合计 26

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [珈百璃的堕落](https://bgm.tv/subject/188091) | 12,650 | 27,483 | [Gabriel DropOut](https://anilist.co/anime/21878) |
| [为美好的世界献上祝福！ 第二季](https://bgm.tv/subject/174043) | 19,595 | 40,852 | [KONOSUBA -God's blessing on this wonderful world! 2](https://anilist.co/anime/21699) |
| [人渣的本愿](https://bgm.tv/subject/174143) | 8,341 | 18,862 | [Scum's Wish](https://anilist.co/anime/21701) |
| [进击的巨人 第二季](https://bgm.tv/subject/118335) | 22,398 | 43,697 | [Attack on Titan Season 2](https://anilist.co/anime/20958) |
| [不正经的魔术讲师与禁忌教典](https://bgm.tv/subject/174138) | 6,005 | 14,149 | [Akashic Records of Bastard Magic Instructor](https://anilist.co/anime/21700) |
| [路人女主的养成方法 ♭](https://bgm.tv/subject/132734) | 15,608 | 33,200 | [Saekano: How to Raise a Boring Girlfriend ♭](https://anilist.co/anime/21180) |
| [笨女孩](https://bgm.tv/subject/208450) | 10,750 | 22,804 | [AHO-GIRL](https://anilist.co/anime/98251) |
| [徒然喜欢你](https://bgm.tv/subject/208754) | 10,845 | 23,870 | [Tsuredure Children](https://anilist.co/anime/98291) |
| [欢迎来到实力至上主义的教室](https://bgm.tv/subject/214272) | 16,115 | 32,504 | [Classroom of the Elite](https://anilist.co/anime/98659) |
| [黑色五叶草](https://bgm.tv/subject/202880) | 2,141 | 6,879 | [Black Clover](https://anilist.co/anime/97940) |
| [宝石之国](https://bgm.tv/subject/214799) | 11,911 | 26,438 | [Land of the Lustrous](https://anilist.co/anime/98707) |
| [干物妹！小埋R](https://bgm.tv/subject/212775) | 10,365 | 22,385 | [Himouto! Umaru-chan R](https://anilist.co/anime/98572) |
| [如果有妹妹就好了。](https://bgm.tv/subject/213076) | 7,248 | 16,769 | [A Sister's All You Need.](https://anilist.co/anime/98596) |
| [3月的狮子 第二季](https://bgm.tv/subject/211567) | 10,779 | 25,761 | [March comes in like a lion Season 2](https://anilist.co/anime/98478) |

该年上游截断项已全部核验并恢复。

### 2018：保留 12，新增 15，合计 27

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [恶魔人 crybaby](https://bgm.tv/subject/211311) | 12,191 | 25,101 | [Devilman Crybaby](https://anilist.co/anime/98460) |
| [龙王的工作！](https://bgm.tv/subject/219658) | 11,247 | 24,255 | [The Ryuo's Work is Never Done!](https://anilist.co/anime/99507) |
| [恋如雨止](https://bgm.tv/subject/210458) | 5,222 | 15,081 | [After the Rain](https://anilist.co/anime/98385) |
| [DARLING in the FRANXX](https://bgm.tv/subject/218711) | 15,004 | 30,040 | [DARLING in the FRANXX](https://anilist.co/anime/99423) |
| [齐木楠雄的灾难 第二季](https://bgm.tv/subject/204027) | 11,911 | 24,294 | [The Disastrous Life of Saiki K. Season 2](https://anilist.co/anime/98034) |
| [卫宫家今天的饭](https://bgm.tv/subject/234349) | 9,070 | 19,830 | [Today's Menu for the Emiya Family](https://anilist.co/anime/100855) |
| [黄金神威](https://bgm.tv/subject/221127) | 4,546 | 12,103 | [Golden Kamuy](https://anilist.co/anime/99699) |
| [命运石之门 0](https://bgm.tv/subject/129807) | 16,574 | 37,521 | [Steins;Gate 0](https://anilist.co/anime/21127) |
| [工作细胞](https://bgm.tv/subject/235612) | 13,595 | 29,288 | [Cells at Work!](https://anilist.co/anime/100977) |
| [来玩游戏吧](https://bgm.tv/subject/236020) | 6,355 | 15,127 | [Asobi Asobase - workshop of fun -](https://anilist.co/anime/101001) |
| [邪神与厨二病少女](https://bgm.tv/subject/231722) | 6,778 | 16,746 | [Dropkick on My Devil!](https://anilist.co/anime/100714) |
| [进击的巨人 第三季](https://bgm.tv/subject/217300) | 21,286 | 42,072 | [Attack on Titan Season 3](https://anilist.co/anime/99147) |
| [关于我转生变成史莱姆这档事](https://bgm.tv/subject/239816) | 14,807 | 31,790 | [That Time I Got Reincarnated as a Slime](https://anilist.co/anime/101280) |
| [JOJO的奇妙冒险 黄金之风](https://bgm.tv/subject/235128) | 16,114 | 32,965 | [JoJo's Bizarre Adventure: Golden Wind](https://anilist.co/anime/102883) |
| [SSSS.古立特](https://bgm.tv/subject/218712) | 12,071 | 24,611 | [SSSS.GRIDMAN](https://anilist.co/anime/99424) |

该年上游截断项已全部核验并恢复。

### 2019：保留 12，新增 14，合计 26

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [灵能百分百 第二季](https://bgm.tv/subject/240760) | 15,479 | 30,602 | [Mob Psycho 100 II](https://anilist.co/anime/101338) |
| [多罗罗](https://bgm.tv/subject/240838) | 6,205 | 14,469 | [Dororo](https://anilist.co/anime/101347) |
| [盾之勇者成名录](https://bgm.tv/subject/217660) | 8,399 | 17,889 | [The Rising of the Shield Hero](https://anilist.co/anime/99263) |
| [约会大作战 第三季](https://bgm.tv/subject/228254) | 7,182 | 16,578 | [Date A Live III](https://anilist.co/anime/100722) |
| [家有女友](https://bgm.tv/subject/253628) | 5,851 | 13,227 | [Domestic Girlfriend](https://anilist.co/anime/103139) |
| [一拳超人 第二季](https://bgm.tv/subject/193619) | 9,220 | 18,958 | [One-Punch Man Season 2](https://anilist.co/anime/97668) |
| [石纪元](https://bgm.tv/subject/266794) | 9,395 | 21,951 | [Dr. STONE](https://anilist.co/anime/105333) |
| [君主·埃尔梅罗二世事件簿 魔眼收集列车 Grace note](https://bgm.tv/subject/267732) | 6,226 | 13,424 | [Lord El-Melloi II's Case Files {Rail Zeppelin} Grace note](https://anilist.co/anime/106918) |
| [擅长捉弄的高木同学 第二季](https://bgm.tv/subject/271151) | 9,467 | 21,726 | [Teasing Master Takagi-san Season 2](https://anilist.co/anime/107068) |
| [只要可爱即使是变态你也会喜欢我吧？](https://bgm.tv/subject/275371) | 4,816 | 12,824 | [Hensuki: Are you willing to fall in love with a pervert, as long as she’s a cutie?](https://anilist.co/anime/107961) |
| [Fate/Grand Order -绝对魔兽战线巴比伦尼亚-](https://bgm.tv/subject/255526) | 6,532 | 14,058 | [Fate/Grand Order Absolute Demonic Front: Babylonia](https://anilist.co/anime/103275) |
| [动物狂想曲](https://bgm.tv/subject/273843) | 9,220 | 20,246 | [BEASTARS](https://anilist.co/anime/107660) |
| [刀剑神域 爱丽丝篇 异界战争](https://bgm.tv/subject/279457) | 8,527 | 18,014 | [Sword Art Online: Alicization - War of Underworld](https://anilist.co/anime/108759) |
| [齐木楠雄的灾难 再始动篇](https://bgm.tv/subject/278899) | 6,105 | 12,964 | [The Disastrous Life of Saiki K.: Reawakened](https://anilist.co/anime/112625) |

该年上游截断项已全部核验并恢复。

### 2020：保留 12，新增 9，合计 21

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [因为太怕痛就全点防御力了。](https://bgm.tv/subject/268545) | 9,831 | 20,568 | [BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.](https://anilist.co/anime/106479) |
| [某科学的超电磁炮T](https://bgm.tv/subject/262940) | 13,047 | 29,380 | [A Certain Scientific Railgun T](https://anilist.co/anime/104462) |
| [转生成为了只有乙女游戏破灭Flag的邪恶大小姐](https://bgm.tv/subject/264089) | 7,949 | 16,834 | [My Next Life as a Villainess: All Routes Lead to Doom!](https://anilist.co/anime/104647) |
| [辉夜大小姐想让我告白?～天才们的恋爱头脑战～](https://bgm.tv/subject/293049) | 25,142 | 49,389 | [Kaguya-sama: Love is War?](https://anilist.co/anime/112641) |
| [Re：从零开始的异世界生活 第二季](https://bgm.tv/subject/278826) | 16,418 | 35,483 | [Re:ZERO -Starting Life in Another World- Season 2](https://anilist.co/anime/108632) |
| [我的青春恋爱物语果然有问题 完](https://bgm.tv/subject/277954) | 12,536 | 28,389 | [My Teen Romantic Comedy SNAFU Climax!](https://anilist.co/anime/108489) |
| [租借女友](https://bgm.tv/subject/296076) | 6,981 | 15,135 | [Rent-a-Girlfriend](https://anilist.co/anime/113813) |
| [在魔王城说晚安](https://bgm.tv/subject/290426) | 6,718 | 15,654 | [Sleepy Princess in the Demon Castle](https://anilist.co/anime/111428) |
| [进击的巨人 最终季](https://bgm.tv/subject/285666) | 15,721 | 33,075 | [Attack on Titan Final Season](https://anilist.co/anime/110277) |

该年上游截断项已全部核验并恢复。

### 2021：保留 12，新增 11，合计 23

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [赛马娘 Pretty Derby 第二季](https://bgm.tv/subject/315574) | 18,034 | 35,253 | [Umamusume: Pretty Derby Season 2](https://anilist.co/anime/124223) |
| [摇曳露营△ 第二季](https://bgm.tv/subject/262897) | 12,668 | 29,156 | [LAID-BACK CAMP SEASON2](https://anilist.co/anime/104459) |
| [关于我转生变成史莱姆这档事 第二季](https://bgm.tv/subject/278031) | 8,320 | 18,788 | [That Time I Got Reincarnated as a Slime Season 2](https://anilist.co/anime/108511) |
| [SSSS.电光机王](https://bgm.tv/subject/296367) | 12,787 | 26,696 | [SSSS.DYNAZENON](https://anilist.co/anime/113950) |
| [薇薇 -萤石眼之歌-](https://bgm.tv/subject/325286) | 8,720 | 18,365 | [Vivy -Fluorite Eye's Song-](https://anilist.co/anime/128546) |
| [佐贺偶像是传奇 复仇](https://bgm.tv/subject/287488) | 9,614 | 20,264 | [ZOMBIE LAND SAGA REVENGE](https://anilist.co/anime/110733) |
| [小林家的龙女仆S](https://bgm.tv/subject/274234) | 14,495 | 32,555 | [Miss Kobayashi's Dragon Maid S](https://anilist.co/anime/107717) |
| [异世界迷宫黑心企业](https://bgm.tv/subject/309668) | 7,235 | 16,103 | [The Dungeon of Black Company](https://anilist.co/anime/120608) |
| [世界顶尖的暗杀者转生为异世界贵族](https://bgm.tv/subject/328313) | 8,600 | 18,286 | [The World's Finest Assassin Gets Reincarnated in Another World as an Aristocrat](https://anilist.co/anime/129898) |
| [JOJO的奇妙冒险 石之海](https://bgm.tv/subject/332261) | 10,439 | 23,598 | [JoJo's Bizarre Adventure: STONE OCEAN](https://anilist.co/anime/131942) |
| [鬼灭之刃 游郭篇](https://bgm.tv/subject/328195) | 12,714 | 26,697 | [Demon Slayer: Kimetsu no Yaiba Entertainment District Arc](https://anilist.co/anime/142329) |

上游截断项中本次未加入：[女神宿舍的宿管君。](https://bgm.tv/subject/305390)（评分 3,051 人，收藏合计 8,810，未达本次关注度门槛）。

### 2022：保留 12，新增 9，合计 21

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [擅长捉弄的高木同学 第三季](https://bgm.tv/subject/347887) | 8,544 | 20,316 | [Teasing Master Takagi-san Season 3](https://anilist.co/anime/138424) |
| [派对浪客诸葛孔明](https://bgm.tv/subject/356756) | 11,585 | 23,679 | [Ya Boy Kongming!](https://anilist.co/anime/141774) |
| [相合之物](https://bgm.tv/subject/333664) | 10,782 | 24,686 | [Deaimon: Recipe for Happiness](https://anilist.co/anime/132532) |
| [辉夜大小姐想让我告白-超级浪漫-](https://bgm.tv/subject/317613) | 23,847 | 47,423 | [Kaguya-sama: Love is War -Ultra Romantic-](https://anilist.co/anime/125367) |
| [契约之吻](https://bgm.tv/subject/375817) | 14,054 | 30,367 | [Engage Kiss](https://anilist.co/anime/146625) |
| [来自深渊 烈日的黄金乡](https://bgm.tv/subject/298477) | 13,915 | 28,462 | [Made in Abyss: The Golden City of the Scorching Sun](https://anilist.co/anime/114745) |
| [赛博朋克：边缘行者](https://bgm.tv/subject/309311) | 27,809 | 52,174 | [Cyberpunk: Edgerunners](https://anilist.co/anime/120377) |
| [四叠半时光机布鲁斯](https://bgm.tv/subject/345980) | 4,373 | 10,367 | [The Tatami Time Machine Blues](https://anilist.co/anime/137819) |
| [灵能百分百 第三季](https://bgm.tv/subject/353605) | 12,143 | 25,514 | [Mob Psycho 100 III](https://anilist.co/anime/140439) |

该年上游截断项已全部核验并恢复。

### 2023：保留 12，新增 10，合计 22

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [转生公主与天才千金的魔法革命](https://bgm.tv/subject/395714) | 9,577 | 20,324 | [The Magical Revolution of the Reincarnated Princess and the Genius Young Lady](https://anilist.co/anime/153629) |
| [异世界悠闲农家](https://bgm.tv/subject/376137) | 4,458 | 10,908 | [Farming Life in Another World](https://anilist.co/anime/146850) |
| [冰海战记 第二季](https://bgm.tv/subject/296739) | 8,288 | 19,444 | [Vinland Saga Season 2](https://anilist.co/anime/136430) |
| [为美好的世界献上爆焰！](https://bgm.tv/subject/385209) | 10,408 | 26,169 | [KONOSUBA -An Explosion on This Wonderful World!](https://anilist.co/anime/150075) |
| [鬼灭之刃 刀匠村篇](https://bgm.tv/subject/369768) | 10,554 | 22,755 | [Demon Slayer: Kimetsu no Yaiba Swordsmith Village Arc](https://anilist.co/anime/145139) |
| [赛马娘 Pretty Derby 巅峰之路](https://bgm.tv/subject/380448) | 7,825 | 16,254 | [Umamusume: Pretty Derby - Road to the Top](https://anilist.co/anime/148370) |
| [无职转生 第二季 ～到了异世界就拿出真本事～](https://bgm.tv/subject/373247) | 17,297 | 36,922 | [Mushoku Tensei: Jobless Reincarnation Season 2](https://anilist.co/anime/146065) |
| [咒术回战 怀玉･玉折 / 涩谷事变](https://bgm.tv/subject/369304) | 10,925 | 24,009 | [JUJUTSU KAISEN Season 2](https://anilist.co/anime/145064) |
| [想要成为影之实力者！ 第二季](https://bgm.tv/subject/419846) | 10,806 | 24,193 | [The Eminence in Shadow Season 2](https://anilist.co/anime/161964) |
| [间谍过家家 第二季](https://bgm.tv/subject/411427) | 11,186 | 26,171 | [SPY x FAMILY Season 2](https://anilist.co/anime/158927) |

该年上游截断项已全部核验并恢复。

### 2024：保留 12，新增 13，合计 25

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [魔都精兵的奴隶](https://bgm.tv/subject/357962) | 5,909 | 17,242 | [Chained Soldier](https://anilist.co/anime/141821) |
| [我心里危险的东西 第二季](https://bgm.tv/subject/441795) | 14,220 | 30,860 | [The Dangers in My Heart Season 2](https://anilist.co/anime/166216) |
| [夜晚的水母不会游泳](https://bgm.tv/subject/425909) | 10,404 | 20,374 | [Jellyfish Can’t Swim in the Night](https://anilist.co/anime/163078) |
| [吹响吧！上低音号 第三季](https://bgm.tv/subject/283643) | 11,802 | 21,364 | [Sound! Euphonium 3](https://anilist.co/anime/109731) |
| [为美好的世界献上祝福！第三季](https://bgm.tv/subject/342667) | 14,056 | 32,861 | [KONOSUBA -God's blessing on this wonderful world! 3](https://anilist.co/anime/136804) |
| [鬼灭之刃 柱训练篇](https://bgm.tv/subject/441939) | 7,862 | 17,518 | [Demon Slayer: Kimetsu no Yaiba Hashira Training Arc](https://anilist.co/anime/166240) |
| [不时轻声地以俄语遮羞的邻座艾莉同学](https://bgm.tv/subject/424883) | 13,315 | 28,965 | [Alya Sometimes Hides Her Feelings in Russian](https://anilist.co/anime/162804) |
| [【我推的孩子】 第二季](https://bgm.tv/subject/443428) | 12,911 | 27,666 | [OSHI NO KO Season 2](https://anilist.co/anime/166531) |
| [物语系列 外传季&怪物季](https://bgm.tv/subject/475354) | 6,283 | 15,670 | [MONOGATARI Series: OFF & MONSTER Season](https://anilist.co/anime/173533) |
| [鹿乃子乃子乃子虎视眈眈](https://bgm.tv/subject/484761) | 7,403 | 17,113 | [My Deer Friend Nokotan](https://anilist.co/anime/175977) |
| [亚托莉 -我挚爱的时光-](https://bgm.tv/subject/397604) | 5,720 | 16,020 | [ATRI -My Dear Moments-](https://anilist.co/anime/154963) |
| [Re：从零开始的异世界生活 第三季](https://bgm.tv/subject/425998) | 9,413 | 24,505 | [Re:ZERO -Starting Life in Another World- Season 3](https://anilist.co/anime/163134) |
| [悲喜渔生](https://bgm.tv/subject/505895) | 5,476 | 12,983 | [Negative Positive Angler](https://anilist.co/anime/179919) |

上游截断项中本次未加入：[缘结甘神家](https://bgm.tv/subject/431370)（评分 2,471 人，收藏合计 7,458，未达本次关注度门槛）。

### 2025：保留 12，新增 13，合计 25

| 新增作品 / 元数据 | Bangumi 评分人数 | Bangumi 收藏合计 | 英文名称参考 |
| --- | ---: | ---: | --- |
| [BanG Dream! Ave Mujica](https://bgm.tv/subject/454684) | 22,184 | 40,905 | [Ave Mujica - The Die is Cast -](https://anilist.co/anime/169295) |
| [我独自升级 第二季 -起于暗影-](https://bgm.tv/subject/487630) | 9,860 | 22,436 | [Solo Leveling Season 2 -Arise from the Shadow-](https://anilist.co/anime/176496) |
| [魔女与使魔](https://bgm.tv/subject/506672) | 6,635 | 20,740 | [WITCH WATCH](https://anilist.co/anime/180367) |
| [夏日口袋](https://bgm.tv/subject/363957) | 8,156 | 28,398 | [Summer Pockets](https://anilist.co/anime/143200) |
| [mono女孩](https://bgm.tv/subject/485936) | 8,192 | 21,468 | [mono](https://anilist.co/anime/176246) |
| [莉可丽丝：友谊是时间的窃贼](https://bgm.tv/subject/504950) | 4,798 | 12,763 | [Lycoris Recoil -Friends are thieves of time.-](https://anilist.co/anime/179706) |
| [章鱼哔的原罪](https://bgm.tv/subject/527620) | 10,953 | 24,472 | [Takopi's Original Sin](https://anilist.co/anime/185407) |
| [胆大党 第二季](https://bgm.tv/subject/529431) | 9,238 | 26,384 | [DAN DA DAN Season 2](https://anilist.co/anime/185660) |
| [Silent Witch 沉默魔女的秘密](https://bgm.tv/subject/506677) | 7,407 | 21,539 | [Secrets of the Silent Witch](https://anilist.co/anime/179966) |
| [更衣人偶坠入爱河 第二季](https://bgm.tv/subject/398951) | 9,416 | 30,447 | [My Dress-Up Darling Season 2](https://anilist.co/anime/154768) |
| [小城日常](https://bgm.tv/subject/514358) | 8,612 | 24,174 | [CITY THE ANIMATION](https://anilist.co/anime/181841) |
| [碧蓝之海 第二季](https://bgm.tv/subject/515880) | 9,528 | 31,256 | [Grand Blue Dreaming Season 2](https://anilist.co/anime/182309) |
| [新 吊带袜天使](https://bgm.tv/subject/390555) | 7,100 | 25,538 | [New PANTY & STOCKING with GARTERBELT](https://anilist.co/anime/151799) |

上游该年没有被截断的候选；新增来自逐年元数据复核。

## 后续维护

- 新条目在对应年份追加新的稳定 ID；不要通过排序重新生成已有 ID，避免破坏作者维护的观看记录。
- 优先保留三语可识别的正式名或已有罗马字名，并检查是否与已存在的同季、分割季度、重编集重复。
- 新年份可以补充，但不要将本次筛选阈值理解为自动收录规则；说明来源与范围即可。此文档仅记录 2026-10-11 这一轮有限审计，未承诺没有其他值得加入的作品。
