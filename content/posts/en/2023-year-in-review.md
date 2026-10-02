---
title: "2023 in Review: Seeing More Clearly, Taking Gains and Losses in Stride"
description: Looking back on backend development after graduation, technical learning, the System Architect exam, and the changes cycling, photography, and everyday life brought this year.
date: 2023-12-23
category: 年终总结
tags: 年终总结, 生活, 工作, 学习
cover: /images/posts/2023-year-in-review/cover.png
type: tech
featured: true
locale: en
translationKey: 2023-year-in-review
---

> 2023 is almost over. The company finished its Q4 review today, so I thought I'd try writing a year-end review of my own and see what I actually did this year.

## 1. Work

**(A little about me)**

Let me start with some background. I graduated in 2022 from a second-tier undergraduate university in Nanchang, Jiangxi, and I currently work in backend development. From September 2021 to March 2022, I interned at Hikvision in Hangzhou for six months. In March 2022, I received an offer from a small company's autumn campus recruitment and started interning there ahead of graduation. From March 2022 to December 2023, that's almost two years—just three months short.

**(Daily schedule)**

My current company probably doesn't feel much like an internet company. We work a 9-to-6 schedule, five days a week. I rent an apartment in a residential complex near the office, about a ten-minute walk away. I get up at 9 every day and start work at 9:30. We have an hour and a half for lunch, so I go home and lie down for a bit, then finish work at 6 in the evening. Our backend team doesn't deploy at night; we do it during the day because our users are overseas and in different time zones. Compared with my classmates and friends, it feels a little strange: they regularly have to work overtime, while in more than a year I've only stayed late twice, until 8:30. All I can say is that there aren't many companies like this left. But spending too long in your comfort zone can leave you going nowhere, like a frog in slowly warming water. After work I don't feel like studying either, so I just play games, watch livestreams, or play Mahjong Soul, staying up until 2 or 3 every night.

**(Backend architecture)**

The company's software products are mainly apps, and our users are overseas. There are only four people on the backend team, including our lead. This year we also refactored our backend architecture. The main stack is JDK 17 + Spring Boot 3.0 + MyBatis-Plus + gRPC + WebClient + MySQL + Redis + Elasticsearch + Nacos (version 2.0) + Apollo for service registration/configuration management + Mycat for table sharding with consistent hashing + RocketMQ + Amazon SQS for message queues + log4j + slf4j for logging / ELK + Flume + Logstash for distributed log storage + Jiguang/FCM for client push notifications + the Sensors Data SDK for analytics tracking, events, and A/B experiments.

Because the business isn't very complicated and the user base isn't large, we make very limited use of middleware. RocketMQ is generally used for asynchronous processing in product flash sales, or for smoothing out traffic peaks when third-party callbacks produce lots of messages. In other situations, I get very little hands-on experience with message queues. I've read about plenty of MQ use cases, but don't have those scenarios to work on. Elasticsearch is mainly used for search and log searching; we don't have cases where it's used for wide tables, data aggregation, or things like that.

**(The work itself)**

I've spent the year doing repetitive work. Product A, which I was responsible for, stopped receiving updates after Q1. Products B and C also stopped after their Q2 iterations, probably because they weren't making enough money. Product D is a little profitable, so we kept iterating on it throughout Q3 and Q4. Some people might think a consumer-facing product must have lots of users, but I checked Product D, the one I handle, and it has 20,000–30,000 daily active users. For now, that means I still don't get to work on backend scenarios with especially high concurrency, QPS, or TPS.

For me, the main thing is to thoroughly understand the business I'm responsible for. Our requirements aren't particularly complicated or painful. As long as I understand the current business and the new requirements, and work out the development logic, I can usually get started. It doesn't take especially advanced technology; MySQL, Redis, and Spring Boot are enough. At first, agile development and rapidly changing requirements helped me grow. Going from being unfamiliar with CRUD to handling it fluently really did get me through that junior stage. But after a long time repeating the same operations—storing information, processing data, and returning information—it doesn't feel all that meaningful anymore, and I don't feel any substantial improvement.

When it came to taking responsibility, I was proactive at first and took on a lot. You know how it is during probation and when you're starting out: you want to grow. Now I just want to hand things off and keep the remaining time for myself, so I can do things that interest me once the requirements are finished.

I also had quite a few problems with communication and expressing myself at the beginning. Through the ongoing product review meetings and discussions, I've slowly been changing: think through what I'm about to say, sort out the logic, and speak slowly without rushing.

## 2. Technical Learning

**Languages:** Java is the language I use at work, along with the Spring ecosystem. In everyday use, I write algorithms, work with Django, build scrapers, and write all sorts of scripts in Python 3. Go is something I pursue out of interest: I use it for algorithms and look for projects to practice on.

**Reading:** *Understanding the JVM* (*深入理解Java虚拟机*), *How MySQL Works* (*MySQL是怎么运行的*), *Redis Design and Implementation* (*Redis设计与实现*), *Java Concurrent Programming* (*Java并发编程*), *Go Language Design and Implementation* (*Go语言设计与实现*), *Hands-on High Concurrency and Microservices with Go* (*Go语言高并发与微服务实战*), *Java Multithreaded Programming* (*Java多线程编程*), *MySQL Internals* (*MySQL技术内幕*), *Python Scripting* (*Python脚本*), *Linux Command Line and Shell Scripting* (*Linux命令行与Shell脚本*)........................

**Technical solutions:** Business needs drive technology. I think what matters is designing solutions around business scenarios. Once there's a scenario, there are different technical approaches to choose from. When I come across a feature in everyday life, I try to think about how it's implemented and what other ways there might be to build it. Summarizing these solutions helps me build my own body of knowledge.

**Open-source middleware:** First understand what it does and how to use it, then look at its overall architecture and design—that's still the stage I'm at—and then read the source code.

My studying is pretty on-and-off too. I spend day after day doing nothing, and my fundamentals aren't solid.

## 3. System Architect Exam (45, 36, 49)

In my third year of university, I took an intermediate software designer qualification in China's computer technology and software professional qualification exam and passed comfortably. I'd actually already wanted to take the System Architect exam in 2022, the year I graduated. An advanced professional qualification could qualify me for Hangzhou's Category E talent designation, and with Hangzhou household registration, there was a monthly rental subsidy of over RMB 2,000. Unfortunately, I hadn't paid social insurance for enough months to meet Hangzhou's registration requirements, so I quietly gave up on it. The System Architect exam is only held once a year. This year, I registered in September, but only started buying study materials and revising during the National Day holiday. After preparing for a month, I took the computer-based exam at Zhejiang University of Technology. The results came out quickly this year, but unfortunately I didn't pass. The first question in the case analysis section changed format this year and covered big data. I hadn't reviewed that area, so I basically scored zero on it. I also didn't answer the later questions on Redis, ORM frameworks, and MySQL primary–replica replication very well. It really was a shame, and I regret not studying the big data material. As for the essay, I hadn't practiced writing one. I memorized the structure of a template before the exam, chose system stability as my topic on the day, and worked the company's project into the essay. I prepared for a month and still didn't pass. It's one of my real regrets this year, and I'm not sure whether I'll take it again next year.

![](/images/posts/2023-year-in-review/01.webp)

![](/images/posts/2023-year-in-review/02.webp)

[github.com/hakusai22/S…](https://github.com/hakusai22/System_Architect/tree/main) These are the materials I collected online and the notes I kept during that month of revision. They might still come in handy next year.

## 4. Life

Since I get off work on time every day, I have plenty of time to myself. When I'm not studying, I'm working out or cycling................ During the summer, my main exercise was playing basketball in my residential complex. During this year's Double 11 shopping festival, I bought an XDS road bike, with the idea of cycling to all of Hangzhou's famous sights. So far, I've mainly been to West Lake, Xianghu Lake, the Qiantang River, and Zhejiang University (the Zijin and Yuquan campuses). It's been too cold in Hangzhou lately, so the other places are still waiting to be explored.

To broaden my interests this year, I also bought a Yamaha guitar to learn on. After spending a few months on the basics, I abandoned it.

Later, I watched a lot of videos about photography and cameras and wanted to give it a try myself, so I bought a Canon RP. Whenever I have time on weekends, I go out and photograph the scenery. Going out and doing something on the weekend makes life feel fuller than staying in my rented apartment. Compared with 2022, I've made quite a few changes this year. Unfortunately, my attempt to lose weight failed; I just couldn't stick to being disciplined.

> Here are a few photos I took on weekend bike rides.

> West Lake

![](/images/posts/2023-year-in-review/03.webp)

> Qiantang River Bridge. It looks beautiful, sure, but it's really high up—way too dangerous.

![](/images/posts/2023-year-in-review/04.webp)

> The flowers at Zhejiang University are quite lovely.

![](/images/posts/2023-year-in-review/05.webp)

## 5. Plans for 2024 — Updated \_03\_17

- Work out in the morning / at noon / in the evening
- Cycling vlogs (ride to all of Hangzhou's sights; Insta360 Ace Pro)
- Broaden and deepen my technical knowledge (RocketMQ source code / go-redis source code / Netty source code / Mycat2 source code)
- Learn photography with the Canon RP and video editing
- Study Japanese / English
- Reach Knight on LeetCode

**To hell with 2023.**

...........

---

Originally published on Juejin: [2023 in Review: Seeing More Clearly, Taking Gains and Losses in Stride](https://juejin.cn/post/7315308701052354614).
