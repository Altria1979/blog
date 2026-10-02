---
title: 2024 Year in Review: Lost in Uncertainty, Looking for a Way Through
description: Looking back after three years of work: product releases, technical growth, the System Architect exam, studying Japanese, and the uncertainty and new experiences in everyday life.
date: 2024-12-07
category: 年终总结
tags: 年终总结, 生活, 工作, 学习
cover: /images/posts/2024-year-in-review/cover-mahjong-9437fcbf.jpg
coverPosition: top
type: tech
featured: true
locale: en
translationKey: 2024-year-in-review
---

> It's December, the last month of the year. People I've met have drifted apart, and the Q4 OKRs are already set. Everything feels bland, and I'm bored with nothing much to do, so I might as well write my year-end review early. I was born in 2000; in another month I'll be 25. It's also been more than three years since I came to Hangzhou on my own. I've been writing a little whenever I have time each day. It's Saturday now, and I wrote until 1 a.m., then watched streams and played mahjong until I finally went to sleep at 5 a.m. I wrote one last year too: [2023 Year in Review: Seeing Things More Clearly, Taking Gains and Losses in Stride](/en/posts/2023-year-in-review). //TODO: The deadline should probably be around the middle of the month.

## Work

> Let me think back. These are probably the things I did at work this year.

- Requested a transfer to another project team; handled routine maintenance and releases for new apps, with a release every two weeks and several apps going at once.
- Completed the upgrade to Apple's StoreKit 2 server APIs for all apps and shipped it.
- Refactored the native API calls in the Google payments/subscriptions SDK.
- Used RocketMQ to improve user-data synchronization across multiple data centers, webhooks, and push notifications.
- Set up RocketMQ-Exporter to monitor relevant performance metrics.
- Implemented message pushes using SSE and server-side gRPC streaming.
- Optimized memory usage on the US machines by switching to the jemalloc memory allocator.
- Upgraded RocketMQ from a single instance to a DLedger cluster as a Q4 task.

Since graduating in March 2022, another quarter will make it three years at this company—the three-year promise. The whole thing has felt like leveling up and fighting monsters. I've watched people come and go: someone I work with leaves, and someone else arrives. Every quarter brings the same repetitive work, with the same old Spring Boot + gRPC stack. After getting familiar with it over the first year, it stopped feeling new. For consumer apps without a large user base, the focus is mostly on the client UI and the user experience. The backend is basically somewhere to store data. How hard can reading and writing data be? Everyone can do it. Each quarter's tasks are essentially routine releases plus some internal server optimizations. If you want a high performance rating, that's nowhere near enough. The basic rule is to deliver releases without triggering alerts and do something valuable that makes a substantial contribution to the team, so you can get an A or be named employee of the quarter.

Over these three years, I've moved up two small levels: P5-1 -> P5-2 -> P5-3. I'm still a junior developer. This year doesn't look promising either. Without two A ratings, there's no chance of moving up to the next band, and I've never owned a project. Comparing my work and promotions with those of friends and classmates around me, all I can say is that I feel useless. I've been taking it far too easy, working 9 to 6, five days a week. Apart from occasionally staying late for a release, nobody works overtime. There isn't that much work that needs overtime anyway.

As for how hard it is to implement product requirements, feed them to ChatGPT and it'll generate the technical proposal and database tables for you. Then you just tweak the code. I use AI for all sorts of Go/Python data scripts too. The real difficulties are reviewing and understanding requirements, and communicating among product, testing, and development. I've looked at the OKRs of the senior and experienced developers on the team; there isn't anything especially different there, and nothing that gives me much guidance. We still had code reviews last year. This year, you just open a PR, tell the leader, and it gets merged without being read. It's the same for everyone else. You can look at their code, but by the time you do, it's usually already merged. Another issue is how poorly information is shared within the team. Only after you ask someone do you find out, “Oh, that other project already did this.”

Compared with 2022 and 2023, when working with the client team was exhausting and I kept putting myself in a very low position, things have improved. Back then, communication went nowhere: they didn't understand my ideas and didn't want to hear my proposals. This year I moved to a different project team, and collaboration has been much smoother. People accept my ideas and even suggest ways to improve them. Overall, it's been a good experience.

**Work tests how you deal with people as well as your technical ability**: getting information and interacting with others. I haven't figured that part out. There isn't anyone my age at the company; most of them have families of their own. I can't even find someone to have a smoke with. I haven't eaten lunch with them this year either. I still live in the residential complex next door, and I can't bear to stay in the office for even a moment during the lunch break. Sitting at home feels better than being at work. These days, I basically only talk about work, never life. Maybe they all have their own circles or group chats. Honestly, there are plenty of times when I don't want to do this anymore. Clocking in and out at the same time every day is really dull and draining. Sitting there all day at work without managing to say a single word would make anyone fall apart. But looking at my own abilities, it'd be hard to find a job I'm happier with than this 9-to-6, five-day schedule. The money 💰 is enough to live on in Hangzhou, so I'll keep my head down 🐶 for now, see whether I can get my base pay raised, and collect the year-end bonus.

> Q2 and Q3 were actually when I got the most out of work in terms of personal growth. Routine releases really aren't much to show off.

- (Q2) Improving RocketMQ integration into business processes: [2024 Q2 OKRs completed: Using RocketMQ to optimize webhook processing and other business scenarios (shipped); recently needed MQ to improve related workflows — Juejin](https://juejin.cn/post/7372020457125052450).
- (Q1/Q2) Upgrading Apple subscriptions to StoreKit 2: reading documentation, gathering and understanding information, reading the official library, and making a small contribution. [Upgrading the Apple StoreKit 2 server APIs (Apple's open-source in-app purchase library) (shipped); the team's server-side technology work in Q1 — Juejin](https://juejin.cn/post/7373944051294666778).
- (Q3) Investigating memory problems: [Java service troubleshooting, from on-heap to off-heap to glibc memory: Best practices and building my own methodology 💥; a temporary production workaround starts with restarting — Juejin](https://juejin.cn/post/7376827589909299226).
- (Q2) Google payments and subscriptions: [Cross-border payments: Optimizing and refactoring the Google Pay purchase/subscription SDK's native V1/V2 API code (shipped); recently moved to the new-products team — Juejin](https://juejin.cn/post/7374308419073589257).

## Life

> The goals I set last year were full of enthusiasm too.

- Pass the System Architect exam and obtain a software copyright registration to qualify for Hangzhou's Category E talent status.
- Work out and lose weight.
- Make cycling vlogs: ride to all of Hangzhou's scenic spots with the Insta360 Ace Pro.
- Learn photography with the Canon RP and learn video editing.
- Study Japanese and English.
- Reach Knight on LeetCode.
- Get a Class D motorcycle license and ride a sport bike.
- Try an in-person Japanese mahjong parlor and enter various online Japanese mahjong tournaments.
- Attend the ClickHouse Hangzhou meetup.
- Update my Juejin blog with everyday technical notes.
- Visit Qiandao Lake.
- Smoke and drink.
- Stream Japanese mahjong on Bilibili.

### The System Architect exam + software copyright registration: Qualifying for Hangzhou's Category E talent status

I was pretty lucky with the System Architect exam. I failed my first attempt last year, then passed on my second attempt this May, just scraping over the cutoff with scores of 52/46/45. Once my Category E status was approved, I switched from the recent-graduate rental subsidy of RMB 5,000 every six months to RMB 2,500 a month. That basically means my rent is free each month. I'm not considering a shared-ownership home, since I don't plan to register my household in Hangzhou. I won't go into all the details here; this blog post covers them. If you'd like to understand the process, feel free to message me privately: [(Hangzhou Category E talent) System Architect exam (52/46/45)—Zhejiang Shuren University / Zhejiang University of Technology, May 25, 2024 — Juejin](https://juejin.cn/post/7372757076937359395).

![img](/images/posts/2024-year-in-review/01.webp)

### Cycling vlogs: Riding to all of Hangzhou's scenic spots with the Insta360 Ace Pro

I've ridden to lots of places on my own, stopping and starting along the way. The route I've done most is along the Qiantang River, from Pengpu Bridge to Fuxing Bridge. I have no idea how many times I've ridden it. I've also been to West Lake, Xiang Lake, Nine Creeks, and all those places. My bike is the youth model sold only online, and it developed plenty of problems later on: the chain rubbing against the chainring, brakes not working. I've lost count of how many times I've repaired it myself. I haven't ridden much these past two months. It's sitting in the basement growing mold, and I'm planning to sell it. And I bought so much cycling gear, too.

The Insta360 Ace Pro I bought for over RMB 3,000 has dropped to around RMB 2,000. I spent ages choosing between DJI and Insta360 at the time, and still ended up regretting it. I tried a DJI Action in a physical store, and the image quality was so much better than the Insta360. I should seriously consider getting a DJI Action 5. It's about time my solo cycling days came to an end and I moved on to a new toy: a sport motorcycle. Woohoo, let's go!

![img](/images/posts/2024-year-in-review/02.webp)

![img](/images/posts/2024-year-in-review/03.webp)

![img](/images/posts/2024-year-in-review/04.webp)

![img](/images/posts/2024-year-in-review/05.webp)

### Working out and losing weight

What can I say? I kept at it for a few days, then slacked off for a few more. My body fat hasn't really changed, and I certainly haven't controlled my diet. Takeout, takeout, takeout, every day. I was fairly motivated in Q1 and Q2. I went to the gym whenever I had time on weekday evenings, and during the day on weekends too. Being at the gym also helped me feel relaxed. There's a community gym in the basement of this residential complex, open 24 hours, with facial-recognition entry, a full set of equipment, and hardly anyone there. It costs RMB 300 a quarter. Later on, probably because I wasn't seeing short-term results and felt exhausted by life, I stopped going for a while. Sometimes I'd wander in when I went downstairs for a smoke. In the end, all I got was a little peace of mind. I didn't have a sensible plan or the determination to keep going. Now I'm so lazy I don't even wear my watch.

![img](/images/posts/2024-year-in-review/06.webp)

![img](/images/posts/2024-year-in-review/07.webp)

![img](/images/posts/2024-year-in-review/08.webp)

![img](/images/posts/2024-year-in-review/09.webp)

### Learning photography with the Canon RP and learning video editing

What can I say? I just stay home on weekends and days off, so the camera is already gathering dust. Apart from September 1, when I got a free ticket and made a special trip to the Hangzhou Botanical Garden to photograph red spider lilies, it hasn't come out at all. My video editing is crap too. Right now, I just use Jianying to make a few videos of pulling characters in Mahjong Soul. I'd still like to learn a professional editing tool later, but that depends on whether I need it.

![img](/images/posts/2024-year-in-review/10.webp)

### Getting a Class D motorcycle license and riding a sport bike

Why did I decide to ride a motorcycle? Mostly because I went home for the Mid-Autumn Festival, and the neighbor next door had already bought one. He offered to let me try it then, but I didn't. After that, I kept following motorcycle-related stuff, and Douyin kept recommending videos to me. That's what led me to get a Class D license. Half a day of practice on the weekend and half a workday for the exam were enough. All four subjects were tested together. It takes much less time than a C1 car license and is a lot quicker.

After getting the license, I went straight to the nearest rental platform one weekend to give it a go. I rode the Zhijiang Road / Meinv Dam route over in Xiaoshan on a Honda 500. My hands went numb from the vibration. I covered 100 km in an hour, and returned the bike after an hour and a half, having ridden 150 km. The overall experience was really good. Both on the way to the ride and while riding, I could forget about the things bothering me in life and at work. The most embarrassing moment was stalling while pulling away at a traffic light. I'll keep renting bikes and going out on weekends, and hopefully find someone to ride with.

![img](/images/posts/2024-year-in-review/11.webp)

![img](/images/posts/2024-year-in-review/12.webp)

![img](/images/posts/2024-year-in-review/13.webp)

### Online Japanese mahjong tournaments and trying an in-person parlor

Every day after work, I order takeout and start playing mahjong. I hang out in all sorts of Japanese mahjong group chats and play friendly matches and team tournaments, staying at it until 2 or 3 a.m. every night. I'm bad at it, but that just makes me want to play more. Competing with people in the groups has also given me a clearer idea of my own ability. I've learned from how others play, and gradually moved from charging in like a wild boar to caring about my deal-in rate. After playing an online tournament the day before, I also went along with one of the guys on a Sunday this month to try Japanese mahjong in person at Hubin Pailangwu in Hangzhou. The thing I've done most this year is play mahjong. After work, it's mahjong and more mahjong.

![img](/images/posts/2024-year-in-review/14.webp)

![img](/images/posts/2024-year-in-review/15.webp)

![img](/images/posts/2024-year-in-review/16.webp)

### Reaching Knight on LeetCode

Basically, I haven't moved an inch. I haven't entered a single contest. Why grind problems? What for? What would I get out of it? I've spent so long in my comfort zone that I don't want to leave, and I can't muster the slightest interest in algorithms anymore. I'll probably only touch them again when I'm about to look for a job. I did actually make a plan to work through Ling Shen's problem list, but I guess I'm just lazy. I can't get myself moving. There's one month left—maybe I should finally get serious? Forget it. Let's play mahjong.

![img](/images/posts/2024-year-in-review/17.webp)

### Other things

This year I attended the **ClickHouse Hangzhou meetup**. Even though I've never used ClickHouse as a database, I went to hear how other companies had put it into production, and wandered around the Alibaba campus.

**Updating my Juejin blog with everyday technical notes** was mostly about taking part in the creator boot camp and practicing my writing. Summarizing things also helps me understand what a problem really is, the process and methods used to solve it, and how other people have solved it. I did get something out of that.

I went to Qiandao Lake with a classmate over the May Day holiday. It didn't end very well, but the experience along the way was good.

**The time I've put into studying Japanese and English** shows its value, whether in using English at work or reading all kinds of documentation, when I'm browsing projects and reading papers.

My interest in Japanese came purely from playing Japanese mahjong, the influence of people in the mahjong groups around me, and watching anime. I finish the daily tasks on Duolingo and bought four books from the *Standard Japanese* and *Minna no Nihongo* series. I've also been watching Yuanyuan's video lessons on Bilibili: [Learn Japanese with a Kyoto University PhD: A brand-new course for the first beginner volume of New Standard Japanese! You can definitely learn it! Detailed explanations to make Japanese easier! Textbook content complete! — Bilibili](https://www.bilibili.com/video/BV1Ti4y1X7yZ/?spm_id_from=333.1007.top_right_bar_window_custom_collection.content.click&vd_source=5c4d3e12d3512ed84532d27dcef8ab0d).

**Smoking and drinking have become as routine as eating a meal.** In the first half of the year, I was hooked on drinking to drown my worries; in the second half, I smoked to pass the time. Every day after work, I don't know what to do, so I look for something enjoyable to fill the hours. Staying up watching streams and playing mahjong, going to bed at 2 or 3 a.m., has become normal. Watching Chenbo and Liuliujiang's streams every night brings me some fun. On weekdays, my 8:50 a.m. alarm usually drags me awake, and I haul my corpse off to work. On weekends, I normally sleep until I wake up on my own around noon or in the afternoon—unless the renovations upstairs or downstairs literally shake me awake.

Looking back like this, I really did spend 2024 doing a lot of meaningless things.

> Although I only wrote 15 posts, they still got around 30,000 views. The numbers don't really matter to me. It's mainly so I can look back on things later. When I share a post, someone who runs into the same problem might find an approach to solving it. Will I keep writing next year, or put the time into something else? I have no idea.

![img](/images/posts/2024-year-in-review/18.webp)

![img](/images/posts/2024-year-in-review/19.webp)

![img](/images/posts/2024-year-in-review/20.webp)

## Personal technical learning

- Broaden my knowledge of AI.
- Give department talks.
- Recommendation systems and RAG.
- Frontend development.
- Third-party payments and subscriptions.
- Study and summarize distributed-systems papers.
- *Computer Networking: A Top-Down Approach*, 7th edition.
- *Computer Systems: A Programmer's Perspective*, 3rd edition.
- *Designing Data-Intensive Applications*.
- Broaden and deepen my technical knowledge: RocketMQ, go-redis, Netty, and Mycat2 source code.

> Study, my ass. I couldn't get in the mood to learn anything. I spent the second half of the year playing mahjong every day.

**My interest in AI mostly comes from the environment around me.** My project team has been using AI in its products all along. Since 2023, the company has been integrating the chat capabilities provided by OpenAI. There have been AI-related competitions inside the company. On the business side, people wanted to build their own knowledge bases and RAG search, mostly using the ready-made knowledge-base features of Redrock on AWS. Some of the team's apps have been using Microsoft's TTS to turn text into audio. Across the department, team, and project team, people have kept sharing AI-related knowledge internally. Product people use Cursor to write up the implementation of their requirements ahead of time, then deploy and ship it themselves.

Following the needs of my project team's products, I've recently changed some payment-related features. For purchasing consumable and recurring-payment products on the web, the main integrations are Stripe credit-card/Visa payments and PayPal. For App Store payments, I've recently been responsible for upgrading the team's StoreKit 2 server APIs and refactoring the code, using the official open-source library: [github.com/apple/app-s…](https://github.com/apple/app-store-server-library-java).

Alipay and WeChat are payment options we offer to users in China. The code is pretty rough, and there haven't been any related feature updates in a long time. As for Google payments, I've had relatively little exposure to that side of the business in the two years I've been here. The overall payment logic is the same as the App Store's. When I have time, I should study and summarize the code flow and the official documentation.

**Knowing only backend development is nowhere near enough now.** It's too easy to replace, unless you're at a medium-sized or large company where roles and responsibilities are very specialized. If you have ideas of your own and want to build your own products later, become an indie developer, or run a one-person company, full-stack is the way to go.

My frontend learning has been scattered too, without using it in a complete large project. Studying [github.com/lobehub/lob…](https://github.com/lobehub/lobe-chat), an open-source React frontend project using TSX + TS, really shook up my understanding. So this is how far frontend development has come. There's no standalone HTML + CSS; everything is encapsulated. Our internal data platform is still built with plain HTML + Django. Whenever we add a feature, the code is AI-generated, and as long as it runs, that's good enough.

> In the second half of the year, I started feeling that the fundamentals really matter. Technology follows business needs; there's no need to chase every new technology. Better to put time into computer-science fundamentals, algorithms, and foundational papers.

For a while, I worked carefully through *Computer Networking: A Top-Down Approach*, 7th edition ([notes on Yuque](https://www.yuque.com/hakusai/gkr7pp/ugtdlk3mbnch2co1)), and *Computer Systems: A Programmer's Perspective*, 3rd edition ([CSAPP notes on Yuque](https://www.yuque.com/hakusai/gkr7pp/cmdemx32cxggdaxx)). I've bought lots of books, but they're all gathering dust. I don't have the drive I had last year.

**Reading papers is a way to learn the theoretical foundations of technology**, and another important benefit is learning English. Mostly, I saw a content creator studying these topics and followed along for a while. Google's big three: GFS, MapReduce, and Bigtable. Reading papers without reading distributed-systems papers is like reading the Four Great Classical Novels without *Dream of the Red Chamber*, reading Tang poetry without Li Bai or Du Fu, or eating instant noodles without the seasoning packet. The Raft/Paxos material really can pull me in for days at a time. I keep reading Hardcore Classroom's articles: [A Guided Reading of the Raft Paper and an Exploration of the etcd Source Code](https://hardcore.feishu.cn/docs/doccnMRVFcMWn1zsEYBrbsDf8De).

**I didn't meet my goal of contributing to open-source projects either.** I put far too little time into it. Even when I had time during or after work, I never really dug into the source code of the components we use. Lately, I've been responsible for setting up a RocketMQ DLedger cluster and optimizing business workflows with MQ, with RocketMQ-Exporter + Herzbeat + Prometheus for monitoring metrics. There have been so many different errors, and each time I've just searched online for examples and fixes. I should use AI at work to take a deeper look into the [RocketMQ source code](https://github.com/apache/rocketmq), writing notes as I go: [RocketMQ 5.2.0 Source Code: Producer](https://lslj4qcpwg.feishu.cn/docx/X5szdEM4ko3LPUxdH9ecrJ2onLI).

> Bits and pieces of learning and notes.

At one point, I looked into machine learning and deep learning again, then big-data development components such as Spark and Flink. On the frontend side, I read about React + TS, looked at demos, and explored open-source Flutter projects. While studying vocabulary, I found out that Momo Vocabulary is written in Node + TS, and that a Ruankao exam-practice app was written in Flutter by an indie developer. Recently, the client team at my company has also been using Flutter to build new apps. I have access to that code too, so I looked into the stack a bit.

At another point, I spent some time learning about Amazon marketplace operations. I also looked into AIGC, agents, images, audio, the Milvus vector database, and related directions, including retrieval-augmented knowledge-base search with RAG. I spent a while learning about recommendation systems, advertising, and search, because we don't have algorithm engineers here and our recommendation functionality is very basic, with no concept of user profiles. For a while, I was drawn to Kitex and Hertz in the CloudWeGo community. I wanted to attend their Shanghai meetup, but unfortunately it was the same week as my System Architect exam. Then I looked into Rust because a mahjong game-record tool was written in it: [github.com/Equim-chan/…](https://github.com/Equim-chan/Mortal).

I remember spending some time thinking about system design and business scenarios too—IM, feeds, local message tables, distributed rate limiting, and so on. It was all just scratching the surface.

The server memory issue in Q2 was on my mind every day, at work and after work. I practically wore out every article on the internet, from on-heap to off-heap to glibc, and asked all sorts of technical experts about the symptoms and scenarios. Nobody on the team could offer any help; I had to rely entirely on myself. None of all this led to any substantial gains or got used in a project, and after a while I forgot almost everything because I hadn't taken notes or written summaries.

Looking back now, I've spent far too little time on technical learning. I have no real drive to pursue technology. I know a little about everything and am good at nothing; I haven't really learned anything. Without Java/Spring, what can I do? Anyone who knows how to use AI could do what I do. I stay up late every night without knowing what I'm staying up for, getting nowhere. I've written very little code over the past year. It's mostly generated by AI, then I make small changes or do a little design work, and I can no longer understand even the code I've written. I'm lost in both life and work, just getting through one day at a time. I want to go home.

## Plans ahead — updated for the first half of the year

- Japanese N2 exam at Zhejiang University in July 2025.
- Prepare for the TOEIC English exam—after passing N2.
- Open-source community projects to broaden my technical horizons and understanding.
- AI and consolidating my own technical knowledge.
- Advance my algorithm skills.
- Electric guitar: anime, comics, and game songs.
- Mahjong Soul / Arknights.
- Exercise and lose body fat.

> Off to play mahjong! If you'd like to play Mahjong Soul together, add me on WeChat: hakusai22.

---

Originally published on Juejin: [2024 Year in Review: Lost in Uncertainty, Looking for a Way Through](https://juejin.cn/post/7445511025702764555).
