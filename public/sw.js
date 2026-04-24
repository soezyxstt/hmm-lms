if (!self.define) {
  let e,
    a = {};
  const c = (c, s) => (
    (c = new URL(c + ".js", s).href),
    a[c] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = c), (e.onload = a), document.head.appendChild(e));
        } else ((e = c), importScripts(c), a());
      }).then(() => {
        let e = a[c];
        if (!e) throw new Error(`Module ${c} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, i) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (a[t]) return;
    let n = {};
    const f = (e) => c(e, t),
      d = { module: { uri: t }, exports: n, require: f };
    a[t] = Promise.all(s.map((e) => d[e] || f(e))).then((e) => (i(...e), n));
  };
}
define(["./workbox-4cdc3ebb"], function (e) {
  "use strict";
  (importScripts("/worker-b9cc2ac8bc659a8b.js"),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/chunks/1100-e26a03430738e809.js",
          revision: "e26a03430738e809",
        },
        {
          url: "/_next/static/chunks/1176-a777a2c3745f4ab8.js",
          revision: "a777a2c3745f4ab8",
        },
        {
          url: "/_next/static/chunks/1528-a503c6edf4a98d3a.js",
          revision: "a503c6edf4a98d3a",
        },
        {
          url: "/_next/static/chunks/1728-3225ecf6ce9f67cb.js",
          revision: "3225ecf6ce9f67cb",
        },
        {
          url: "/_next/static/chunks/1747-5c5d9bf98eb1c106.js",
          revision: "5c5d9bf98eb1c106",
        },
        {
          url: "/_next/static/chunks/1833-8baba53199733912.js",
          revision: "8baba53199733912",
        },
        {
          url: "/_next/static/chunks/1866-70ec71b428871b74.js",
          revision: "70ec71b428871b74",
        },
        {
          url: "/_next/static/chunks/1966.b8f83f7ba376c962.js",
          revision: "b8f83f7ba376c962",
        },
        {
          url: "/_next/static/chunks/2003-c53415ef5532ab32.js",
          revision: "c53415ef5532ab32",
        },
        {
          url: "/_next/static/chunks/2035-03390925cd10b5e6.js",
          revision: "03390925cd10b5e6",
        },
        {
          url: "/_next/static/chunks/2147-3a708ee3d3e7534c.js",
          revision: "3a708ee3d3e7534c",
        },
        {
          url: "/_next/static/chunks/2170a4aa-a34a61dbb98d02b6.js",
          revision: "a34a61dbb98d02b6",
        },
        {
          url: "/_next/static/chunks/2217-d13a8814ff380847.js",
          revision: "d13a8814ff380847",
        },
        {
          url: "/_next/static/chunks/227-b02e2f406c6c1d49.js",
          revision: "b02e2f406c6c1d49",
        },
        {
          url: "/_next/static/chunks/2507-2d6ec071cb313600.js",
          revision: "2d6ec071cb313600",
        },
        {
          url: "/_next/static/chunks/2639-430ad28cf1064398.js",
          revision: "430ad28cf1064398",
        },
        {
          url: "/_next/static/chunks/2759-650115d6acea68d9.js",
          revision: "650115d6acea68d9",
        },
        {
          url: "/_next/static/chunks/2820-ab48b9734f699c28.js",
          revision: "ab48b9734f699c28",
        },
        {
          url: "/_next/static/chunks/2947-74a24f106a312a63.js",
          revision: "74a24f106a312a63",
        },
        {
          url: "/_next/static/chunks/2976-3a2d2761b47f3d8b.js",
          revision: "3a2d2761b47f3d8b",
        },
        {
          url: "/_next/static/chunks/3014691f-fea16e4a5816bf8f.js",
          revision: "fea16e4a5816bf8f",
        },
        {
          url: "/_next/static/chunks/3044-f504cff0e1b1a2f6.js",
          revision: "f504cff0e1b1a2f6",
        },
        {
          url: "/_next/static/chunks/3183-5b18bdad92513de6.js",
          revision: "5b18bdad92513de6",
        },
        {
          url: "/_next/static/chunks/3231-a4445219a60da4e7.js",
          revision: "a4445219a60da4e7",
        },
        {
          url: "/_next/static/chunks/326-d200d2e5d6e5e89a.js",
          revision: "d200d2e5d6e5e89a",
        },
        {
          url: "/_next/static/chunks/3349-ea31c77a5a159ae8.js",
          revision: "ea31c77a5a159ae8",
        },
        {
          url: "/_next/static/chunks/3899.3f761f7e3a944e8c.js",
          revision: "3f761f7e3a944e8c",
        },
        {
          url: "/_next/static/chunks/4420-9ce4aeffcbaa24d3.js",
          revision: "9ce4aeffcbaa24d3",
        },
        {
          url: "/_next/static/chunks/4565-8470db6a206c8abc.js",
          revision: "8470db6a206c8abc",
        },
        {
          url: "/_next/static/chunks/4865-06521272efc62094.js",
          revision: "06521272efc62094",
        },
        {
          url: "/_next/static/chunks/4bd1b696-e356ca5ba0218e27.js",
          revision: "e356ca5ba0218e27",
        },
        {
          url: "/_next/static/chunks/541-45c0af140aee5cfe.js",
          revision: "45c0af140aee5cfe",
        },
        {
          url: "/_next/static/chunks/5419-9b9f3999ceb0ff14.js",
          revision: "9b9f3999ceb0ff14",
        },
        {
          url: "/_next/static/chunks/5435-1d43957805fdef2c.js",
          revision: "1d43957805fdef2c",
        },
        {
          url: "/_next/static/chunks/54a60aa6-888557188273e76e.js",
          revision: "888557188273e76e",
        },
        {
          url: "/_next/static/chunks/5909-8d090c29091d35e6.js",
          revision: "8d090c29091d35e6",
        },
        {
          url: "/_next/static/chunks/604-85f224627711755d.js",
          revision: "85f224627711755d",
        },
        {
          url: "/_next/static/chunks/6067-54790088255c8e9d.js",
          revision: "54790088255c8e9d",
        },
        {
          url: "/_next/static/chunks/6133-b680f2463c92bfc0.js",
          revision: "b680f2463c92bfc0",
        },
        {
          url: "/_next/static/chunks/6270-5c5b889950f5aa19.js",
          revision: "5c5b889950f5aa19",
        },
        {
          url: "/_next/static/chunks/6437-b7e287e96b3bf7c5.js",
          revision: "b7e287e96b3bf7c5",
        },
        {
          url: "/_next/static/chunks/6609-078a8cdc853f87c6.js",
          revision: "078a8cdc853f87c6",
        },
        {
          url: "/_next/static/chunks/6635-eaec7cea742d4217.js",
          revision: "eaec7cea742d4217",
        },
        {
          url: "/_next/static/chunks/6695-8de726293b71800d.js",
          revision: "8de726293b71800d",
        },
        {
          url: "/_next/static/chunks/6798-1fb7a998946f0c9f.js",
          revision: "1fb7a998946f0c9f",
        },
        {
          url: "/_next/static/chunks/6835-2019a3eb01c2bc99.js",
          revision: "2019a3eb01c2bc99",
        },
        {
          url: "/_next/static/chunks/7064-61c3fe3fb25851d4.js",
          revision: "61c3fe3fb25851d4",
        },
        {
          url: "/_next/static/chunks/70e0d97a-2b6005b756be7f5d.js",
          revision: "2b6005b756be7f5d",
        },
        {
          url: "/_next/static/chunks/7125-0e1d89d5e38a150e.js",
          revision: "0e1d89d5e38a150e",
        },
        {
          url: "/_next/static/chunks/7158-7f196ac4d74c137c.js",
          revision: "7f196ac4d74c137c",
        },
        {
          url: "/_next/static/chunks/7291-2de2eccb4888d03f.js",
          revision: "2de2eccb4888d03f",
        },
        {
          url: "/_next/static/chunks/7793-0f382abb62f854d9.js",
          revision: "0f382abb62f854d9",
        },
        {
          url: "/_next/static/chunks/7902-6af40324cfc29438.js",
          revision: "6af40324cfc29438",
        },
        {
          url: "/_next/static/chunks/7906-2f5033e8bbb410b6.js",
          revision: "2f5033e8bbb410b6",
        },
        {
          url: "/_next/static/chunks/8007-8109081d37a2b7e5.js",
          revision: "8109081d37a2b7e5",
        },
        {
          url: "/_next/static/chunks/8035-e5e0ad74897707cf.js",
          revision: "e5e0ad74897707cf",
        },
        {
          url: "/_next/static/chunks/8090-6a5a30d4b095a737.js",
          revision: "6a5a30d4b095a737",
        },
        {
          url: "/_next/static/chunks/8091-5c36ac40283ec0ce.js",
          revision: "5c36ac40283ec0ce",
        },
        {
          url: "/_next/static/chunks/8097-e61148579294ed09.js",
          revision: "e61148579294ed09",
        },
        {
          url: "/_next/static/chunks/8305-1bd33a3f523ce89d.js",
          revision: "1bd33a3f523ce89d",
        },
        {
          url: "/_next/static/chunks/8437-34b553fdebc3c29f.js",
          revision: "34b553fdebc3c29f",
        },
        {
          url: "/_next/static/chunks/8500-f62a38ff68ab7f42.js",
          revision: "f62a38ff68ab7f42",
        },
        {
          url: "/_next/static/chunks/8609-1303379b4f2e41b8.js",
          revision: "1303379b4f2e41b8",
        },
        {
          url: "/_next/static/chunks/8851-032e25efdfdac38b.js",
          revision: "032e25efdfdac38b",
        },
        {
          url: "/_next/static/chunks/8928-130a975402943d2d.js",
          revision: "130a975402943d2d",
        },
        {
          url: "/_next/static/chunks/9054-6277f8b7ece78aca.js",
          revision: "6277f8b7ece78aca",
        },
        {
          url: "/_next/static/chunks/9286-130e2a739938afb5.js",
          revision: "130e2a739938afb5",
        },
        {
          url: "/_next/static/chunks/935-70f754e65fc73df1.js",
          revision: "70f754e65fc73df1",
        },
        {
          url: "/_next/static/chunks/9432-f9a53cbd89602a87.js",
          revision: "f9a53cbd89602a87",
        },
        {
          url: "/_next/static/chunks/9493-04446a599d1dcdab.js",
          revision: "04446a599d1dcdab",
        },
        {
          url: "/_next/static/chunks/9673-bebc5518660b2d59.js",
          revision: "bebc5518660b2d59",
        },
        {
          url: "/_next/static/chunks/9854-426ff524b662789a.js",
          revision: "426ff524b662789a",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/announcements/%5Bid%5D/page-1106ace1c0fa941e.js",
          revision: "1106ace1c0fa941e",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/announcements/page-ee36224704446a9b.js",
          revision: "ee36224704446a9b",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/courses/%5Bid%5D/page-b604dfe840416502.js",
          revision: "b604dfe840416502",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/courses/%5Bid%5D/template-92f0e139ca68c5f6.js",
          revision: "92f0e139ca68c5f6",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/courses/page-e61ece287bbd4c72.js",
          revision: "e61ece287bbd4c72",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/dashboard/page-7044689965453065.js",
          revision: "7044689965453065",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/events/%5Bid%5D/page-3507a5fcaef3cff7.js",
          revision: "3507a5fcaef3cff7",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/events/page-2ce0616ec27863d0.js",
          revision: "2ce0616ec27863d0",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/hall-of-fame/page-f0bceaa8578ebd3e.js",
          revision: "f0bceaa8578ebd3e",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/hotline/page-55a98fbbb9d3a13f.js",
          revision: "55a98fbbb9d3a13f",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/layout-46198bbcaa7d85c0.js",
          revision: "46198bbcaa7d85c0",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/loker/%5Bid%5D/page-c636723ccd2c3c63.js",
          revision: "c636723ccd2c3c63",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/loker/page-1adec3ac6dcca69b.js",
          revision: "1adec3ac6dcca69b",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/profile/page-a69cc46698b87266.js",
          revision: "a69cc46698b87266",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/schedule/page-f15657d5b9ce9dfc.js",
          revision: "f15657d5b9ce9dfc",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/scholarships/%5Bid%5D/page-b88f7729ef91b54b.js",
          revision: "b88f7729ef91b54b",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/scholarships/page-1b91f1076db93c85.js",
          revision: "1b91f1076db93c85",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/settings/page-abf67063268a18d3.js",
          revision: "abf67063268a18d3",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/tryouts/%5Bid%5D/attempt/%5BattemptId%5D/page-25512787dd243c9b.js",
          revision: "25512787dd243c9b",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/tryouts/%5Bid%5D/page-b7d327b5f880ee0a.js",
          revision: "b7d327b5f880ee0a",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/tryouts/%5Bid%5D/results/%5BattemptId%5D/page-41e825004abd129e.js",
          revision: "41e825004abd129e",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/tryouts/%5Bid%5D/template-bd2e3def3161770d.js",
          revision: "bd2e3def3161770d",
        },
        {
          url: "/_next/static/chunks/app/(with-sidebar)/tryouts/page-b7d327b5f880ee0a.js",
          revision: "b7d327b5f880ee0a",
        },
        {
          url: "/_next/static/chunks/app/_global-error/page-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/admin/analytics/page-8a1ce4bcf4de03fc.js",
          revision: "8a1ce4bcf4de03fc",
        },
        {
          url: "/_next/static/chunks/app/admin/announcements/%5Bid%5D/edit/page-51e9e4cba05b35f4.js",
          revision: "51e9e4cba05b35f4",
        },
        {
          url: "/_next/static/chunks/app/admin/announcements/create/page-ee277d282ef6f52d.js",
          revision: "ee277d282ef6f52d",
        },
        {
          url: "/_next/static/chunks/app/admin/announcements/page-4805ec870136ebd5.js",
          revision: "4805ec870136ebd5",
        },
        {
          url: "/_next/static/chunks/app/admin/courses/%5Bid%5D/edit/page-b23f5b10f79f3afa.js",
          revision: "b23f5b10f79f3afa",
        },
        {
          url: "/_next/static/chunks/app/admin/courses/create/page-ee277d282ef6f52d.js",
          revision: "ee277d282ef6f52d",
        },
        {
          url: "/_next/static/chunks/app/admin/courses/page-c2dbe74ef7d6accf.js",
          revision: "c2dbe74ef7d6accf",
        },
        {
          url: "/_next/static/chunks/app/admin/database/page-ff120be662d15a05.js",
          revision: "ff120be662d15a05",
        },
        {
          url: "/_next/static/chunks/app/admin/events/%5Bid%5D/edit/page-a352418dbdba1305.js",
          revision: "a352418dbdba1305",
        },
        {
          url: "/_next/static/chunks/app/admin/events/%5Bid%5D/page-99301826de129779.js",
          revision: "99301826de129779",
        },
        {
          url: "/_next/static/chunks/app/admin/events/create/page-ee277d282ef6f52d.js",
          revision: "ee277d282ef6f52d",
        },
        {
          url: "/_next/static/chunks/app/admin/events/page-ba3e19ce14e95c7a.js",
          revision: "ba3e19ce14e95c7a",
        },
        {
          url: "/_next/static/chunks/app/admin/forms/create/page-4310776698f2a1a7.js",
          revision: "4310776698f2a1a7",
        },
        {
          url: "/_next/static/chunks/app/admin/forms/edit/%5Bid%5D/page-cbf35905c1cd01b1.js",
          revision: "cbf35905c1cd01b1",
        },
        {
          url: "/_next/static/chunks/app/admin/forms/page-40db20cb76e9b4f4.js",
          revision: "40db20cb76e9b4f4",
        },
        {
          url: "/_next/static/chunks/app/admin/forms/preview/%5Bid%5D/page-292938d8925c3652.js",
          revision: "292938d8925c3652",
        },
        {
          url: "/_next/static/chunks/app/admin/forms/responses/%5Bid%5D/page-5a4a17261ebc4ee8.js",
          revision: "5a4a17261ebc4ee8",
        },
        {
          url: "/_next/static/chunks/app/admin/layout-5c89550ca9f459c6.js",
          revision: "5c89550ca9f459c6",
        },
        {
          url: "/_next/static/chunks/app/admin/loading-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/admin/loker/page-a1d28202d8679047.js",
          revision: "a1d28202d8679047",
        },
        {
          url: "/_next/static/chunks/app/admin/page-eb81aa2f7aa71d5c.js",
          revision: "eb81aa2f7aa71d5c",
        },
        {
          url: "/_next/static/chunks/app/admin/scholarships/%5Bid%5D/edit/page-b41d90ce3f692a82.js",
          revision: "b41d90ce3f692a82",
        },
        {
          url: "/_next/static/chunks/app/admin/scholarships/create/page-ee277d282ef6f52d.js",
          revision: "ee277d282ef6f52d",
        },
        {
          url: "/_next/static/chunks/app/admin/scholarships/page-54d5e992a2f11431.js",
          revision: "54d5e992a2f11431",
        },
        {
          url: "/_next/static/chunks/app/admin/shortlinks/create/page-29dfc1a24e5a47df.js",
          revision: "29dfc1a24e5a47df",
        },
        {
          url: "/_next/static/chunks/app/admin/shortlinks/page-3d309175d89597c8.js",
          revision: "3d309175d89597c8",
        },
        {
          url: "/_next/static/chunks/app/admin/tryouts/%5Bid%5D/edit/page-f811fcafff2c3342.js",
          revision: "f811fcafff2c3342",
        },
        {
          url: "/_next/static/chunks/app/admin/tryouts/%5Bid%5D/page-e4b9f490802637a5.js",
          revision: "e4b9f490802637a5",
        },
        {
          url: "/_next/static/chunks/app/admin/tryouts/create/page-ee277d282ef6f52d.js",
          revision: "ee277d282ef6f52d",
        },
        {
          url: "/_next/static/chunks/app/admin/tryouts/page-b00f22540c5d3e11.js",
          revision: "b00f22540c5d3e11",
        },
        {
          url: "/_next/static/chunks/app/admin/users/page-d0afce2a3a612c66.js",
          revision: "d0afce2a3a612c66",
        },
        {
          url: "/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/documents/%5Bid%5D/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/documents/delete/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/documents/upload/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/notifications/send/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/notifications/subscribe/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/notifications/test/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/notifications/webhook/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/trpc/%5Btrpc%5D/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/api/videos/%5Bid%5D/route-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/auth/sign-in/page-7f3944b7a23337e0.js",
          revision: "7f3944b7a23337e0",
        },
        {
          url: "/_next/static/chunks/app/auth/sign-out/page-4e983396ea0c5d69.js",
          revision: "4e983396ea0c5d69",
        },
        {
          url: "/_next/static/chunks/app/auth/sign-up/page-b8bc2e41cf3859cb.js",
          revision: "b8bc2e41cf3859cb",
        },
        {
          url: "/_next/static/chunks/app/error-d101189467f9a2a6.js",
          revision: "d101189467f9a2a6",
        },
        {
          url: "/_next/static/chunks/app/forms/%5Bid%5D/page-9e2a96a79793929d.js",
          revision: "9e2a96a79793929d",
        },
        {
          url: "/_next/static/chunks/app/forms/%5Bid%5D/result/page-b0e0105d905c0412.js",
          revision: "b0e0105d905c0412",
        },
        {
          url: "/_next/static/chunks/app/forms/layout-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/layout-5140ab3afd12d0fe.js",
          revision: "5140ab3afd12d0fe",
        },
        {
          url: "/_next/static/chunks/app/loading-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/not-found-487a62653cc09d24.js",
          revision: "487a62653cc09d24",
        },
        {
          url: "/_next/static/chunks/app/page-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/app/s/%5Bslug%5D/page-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/ee560e2c-3d4d276f6fb4ef88.js",
          revision: "3d4d276f6fb4ef88",
        },
        {
          url: "/_next/static/chunks/framework-34a8c4228d7fd161.js",
          revision: "34a8c4228d7fd161",
        },
        {
          url: "/_next/static/chunks/main-1903aacd6babefd6.js",
          revision: "1903aacd6babefd6",
        },
        {
          url: "/_next/static/chunks/main-app-f881e09bac9f4dab.js",
          revision: "f881e09bac9f4dab",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/app-error-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/forbidden-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/global-error-5385f87b756fb3be.js",
          revision: "5385f87b756fb3be",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/unauthorized-e0ff6b7c91dc2e64.js",
          revision: "e0ff6b7c91dc2e64",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-494151dd825fb0c5.js",
          revision: "494151dd825fb0c5",
        },
        {
          url: "/_next/static/css/226d7246781fda18.css",
          revision: "226d7246781fda18",
        },
        {
          url: "/_next/static/css/e540b60adee1d5eb.css",
          revision: "e540b60adee1d5eb",
        },
        {
          url: "/_next/static/j0mOy68_YGODUKPD3RA-Z/_buildManifest.js",
          revision: "a5503268b449afc7997ad401a19d82f7",
        },
        {
          url: "/_next/static/j0mOy68_YGODUKPD3RA-Z/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/media/001f750b538f7a9e-s.woff2",
          revision: "a0c5b49eea2028b7fd6e3b0d0d1c8a0a",
        },
        {
          url: "/_next/static/media/0171bebee5f5419f-s.woff2",
          revision: "def75f5932dd535ead833ccd67a8b18d",
        },
        {
          url: "/_next/static/media/034d78ad42e9620c-s.woff2",
          revision: "be7c930fceb794521be0a68e113a71d8",
        },
        {
          url: "/_next/static/media/0484562807a97172-s.p.woff2",
          revision: "b550bca8934bd86812d1f5e28c9cc1de",
        },
        {
          url: "/_next/static/media/07fccecd6728972a-s.woff2",
          revision: "3a2cd1c3db938c6bdffdb73938e44590",
        },
        {
          url: "/_next/static/media/0e9d289c6eb42bf7-s.p.woff2",
          revision: "6a68d0af647150cb9701577064f93400",
        },
        {
          url: "/_next/static/media/0ea4f4df910e6120-s.woff2",
          revision: "e71038f54837353ab229e80d06a1ecb2",
        },
        {
          url: "/_next/static/media/15e555873b2c38f2-s.woff2",
          revision: "378deccce04e8b4bb10df0d68116fe7b",
        },
        {
          url: "/_next/static/media/1755441e3a2fa970-s.p.woff2",
          revision: "86d512f8885dcf964fa570ce49f19d65",
        },
        {
          url: "/_next/static/media/19cfc7226ec3afaa-s.woff2",
          revision: "9dda5cfc9a46f256d0e131bb535e46f8",
        },
        {
          url: "/_next/static/media/1a634e73dfeff02c-s.woff2",
          revision: "536359ff0fc970eef8be299490b3eaff",
        },
        {
          url: "/_next/static/media/1d8a05b60287ae6c-s.woff2",
          revision: "dd2952a08bbf942e1ed616905cab12f1",
        },
        {
          url: "/_next/static/media/1e41be92c43b3255-s.p.woff2",
          revision: "b7627e3c9663757d70121f2ad4c8d986",
        },
        {
          url: "/_next/static/media/1f160ec2cb9962ef-s.woff2",
          revision: "7dca4e0f3d0e79afbe67ea05696bf25b",
        },
        {
          url: "/_next/static/media/1f173e5e25f3efee-s.woff2",
          revision: "f143fb4877cf7ada1b84423ee86a0198",
        },
        {
          url: "/_next/static/media/21350d82a1f187e9-s.woff2",
          revision: "4e2553027f1d60eff32898367dd4d541",
        },
        {
          url: "/_next/static/media/29a4aea02fdee119-s.woff2",
          revision: "69d9d2cdadeab7225297d50fc8e48e8b",
        },
        {
          url: "/_next/static/media/29e7bbdce9332268-s.woff2",
          revision: "9e3ecbe4bb4c6f0b71adc1cd481c2bdc",
        },
        {
          url: "/_next/static/media/325259dae461ae2a-s.woff2",
          revision: "8433e08f6088d84b9f68a4d17f202123",
        },
        {
          url: "/_next/static/media/3381559cf14f02c6-s.p.woff2",
          revision: "85549c16cd0fe7de20ea0b5664335a29",
        },
        {
          url: "/_next/static/media/3c0a36d4615ad53c-s.woff2",
          revision: "192fa73323a2be4d628daabfbe7303ab",
        },
        {
          url: "/_next/static/media/3f552249f03de128-s.woff2",
          revision: "f13e27df67f3cd8ec7f1ebef1d3c22bd",
        },
        {
          url: "/_next/static/media/4120b0a488381b31-s.woff2",
          revision: "1e5f06cab9f9fe1f9df22e2e2aeae2e4",
        },
        {
          url: "/_next/static/media/46bdd75a3ff56824-s.p.woff2",
          revision: "1fde3bbfa79563c8c15f10e025b4002c",
        },
        {
          url: "/_next/static/media/486fce9f36bc8f45-s.woff2",
          revision: "f438d3567fa12978d92ef6eee43d3f11",
        },
        {
          url: "/_next/static/media/48e2044251ef3125-s.woff2",
          revision: "45ea393f38e4ecd97f4dbeb12ef23877",
        },
        {
          url: "/_next/static/media/4c285fdca692ea22-s.p.woff2",
          revision: "42d3308e3aca8742731f63154187bdd7",
        },
        {
          url: "/_next/static/media/4cf2300e9c8272f7-s.p.woff2",
          revision: "18bae71b1e1b2bb25321090a3b563103",
        },
        {
          url: "/_next/static/media/4f48fe9100901594-s.woff2",
          revision: "4409a8110fdf0ba9059a609f00deafbd",
        },
        {
          url: "/_next/static/media/5eae37b69937655e-s.woff2",
          revision: "a721fb76b97a8ad2d71e6466a663e7d1",
        },
        {
          url: "/_next/static/media/6c177e25b87fd9cd-s.woff2",
          revision: "4f9434d4845212443bbd9d102f1f5d7d",
        },
        {
          url: "/_next/static/media/6c9a125e97d835e1-s.woff2",
          revision: "889718d692d5bfc6019cbdfcb5cc106f",
        },
        {
          url: "/_next/static/media/6f22fce21a7c433c-s.woff2",
          revision: "db4848d96b0e30ee12d7b0a924cf3b24",
        },
        {
          url: "/_next/static/media/739c2d8941231bb4-s.p.woff2",
          revision: "99073479f71fe0280bb88d5b1e7322b7",
        },
        {
          url: "/_next/static/media/77c207b095007c34-s.woff2",
          revision: "cd3472cf160eaa52572441cf930a93a4",
        },
        {
          url: "/_next/static/media/80841ae24d03ed90-s.woff2",
          revision: "f852254ed0041481aaac038e94fb24dc",
        },
        {
          url: "/_next/static/media/82ef96de0e8f4d8c-s.woff2",
          revision: "ddf8cb57367a47414aa2d47aab4041bc",
        },
        {
          url: "/_next/static/media/8888a3826f4a3af4-s.p.woff2",
          revision: "792477d09826b11d1e5a611162c9797a",
        },
        {
          url: "/_next/static/media/8d697b304b401681-s.woff2",
          revision: "cc728f6c0adb04da0dfcb0fc436a8ae5",
        },
        {
          url: "/_next/static/media/8e9860b6e62d6359-s.woff2",
          revision: "01ba6c2a184b8cba08b0d57167664d75",
        },
        {
          url: "/_next/static/media/904be59b21bd51cb-s.p.woff2",
          revision: "c154477b9affa3a0a47f894c8b80c03c",
        },
        {
          url: "/_next/static/media/963f5d48c32dcae9-s.p.woff2",
          revision: "c9375f326644d60fefa656b8ad5ba5d7",
        },
        {
          url: "/_next/static/media/970d71e7dcbc144d-s.woff2",
          revision: "c65df4878c04253139ed838edf774dee",
        },
        {
          url: "/_next/static/media/a1386beebedccca4-s.woff2",
          revision: "d3aa06d13d3cf9c0558927051f3cb948",
        },
        {
          url: "/_next/static/media/a6ecd16fa044d500-s.woff2",
          revision: "e63dd45b3f5d159b8ec974a3b183c060",
        },
        {
          url: "/_next/static/media/ad8a7e2c3c2c120b-s.woff2",
          revision: "32c09070370c25706e8698cca94f7e84",
        },
        {
          url: "/_next/static/media/aff07a691b37f215-s.woff2",
          revision: "b21794c0183b6657f947c98351d07a78",
        },
        {
          url: "/_next/static/media/b1f344208eb4edfe-s.woff2",
          revision: "b5818778898bf6d34b7423ff99c6beb4",
        },
        {
          url: "/_next/static/media/b3f718d64f9a6dea-s.woff2",
          revision: "7b8d2e8d1d6863bd8250cdfe9b2a583e",
        },
        {
          url: "/_next/static/media/b957ea75a84b6ea7-s.p.woff2",
          revision: "0bd523f6049956faaf43c254a719d06a",
        },
        {
          url: "/_next/static/media/ba015fad6dcf6784-s.woff2",
          revision: "8ea4f719af3312a055caf09f34c89a77",
        },
        {
          url: "/_next/static/media/ba9851c3c22cd980-s.woff2",
          revision: "9e494903d6b0ffec1a1e14d34427d44d",
        },
        {
          url: "/_next/static/media/bd82c78e5b7b3fe9-s.woff2",
          revision: "9aee894ca91b94bee65c84906578850d",
        },
        {
          url: "/_next/static/media/bf24a9759715e608-s.woff2",
          revision: "d185d272afd4e2d7b4801eabba1463a1",
        },
        {
          url: "/_next/static/media/c123193bbb21965c-s.p.woff2",
          revision: "42d75f387abec189535f8ddf7bc065f3",
        },
        {
          url: "/_next/static/media/c32c8052c071fc42-s.woff2",
          revision: "01b4a8bff3ad7fca1e516fd6e45f0794",
        },
        {
          url: "/_next/static/media/c3bc380753a8436c-s.woff2",
          revision: "5a1b7c983a9dc0a87a2ff138e07ae822",
        },
        {
          url: "/_next/static/media/c5fe6dc8356a8c31-s.woff2",
          revision: "027a89e9ab733a145db70f09b8a18b42",
        },
        {
          url: "/_next/static/media/c8db6d45c695a7ab-s.woff2",
          revision: "184b7cb71a92503167ac9019d5ad0cc6",
        },
        {
          url: "/_next/static/media/cd5bec9268da5b8d-s.p.woff2",
          revision: "aad916909583a6c3b1556203237cf97b",
        },
        {
          url: "/_next/static/media/cde148027b808b99-s.woff2",
          revision: "6c9556921ca60efd3d9e73240485e345",
        },
        {
          url: "/_next/static/media/cedc0d4e6b719cc0-s.p.woff2",
          revision: "26f7bf116b51e60d99cc17554e9a5315",
        },
        {
          url: "/_next/static/media/d1f57dee88fa787e-s.p.woff2",
          revision: "a8f08067d81c3aed054c74054ceab5d8",
        },
        {
          url: "/_next/static/media/d66e7b924e5a6a9e-s.p.woff2",
          revision: "f36fd0e47cc325c42346c1c0852e077e",
        },
        {
          url: "/_next/static/media/d8f3713f2c4f699b-s.woff2",
          revision: "e75b4852893cecbe4dbe49f188875755",
        },
        {
          url: "/_next/static/media/db911767852bc875-s.woff2",
          revision: "9516f567cd80b0f418bba2f1299ed6d1",
        },
        {
          url: "/_next/static/media/df0a9ae256c0569c-s.woff2",
          revision: "d54db44de5ccb18886ece2fda72bdfe0",
        },
        {
          url: "/_next/static/media/e44cdba7d0878bc5-s.woff2",
          revision: "bd711a747d416f46892596919ccde9dc",
        },
        {
          url: "/_next/static/media/e4af272ccee01ff0-s.p.woff2",
          revision: "65850a373e258f1c897a2b3d75eb74de",
        },
        {
          url: "/_next/static/media/e61ae719f7cc4155-s.woff2",
          revision: "b20465c98c6e9085d8f74b0032e5287b",
        },
        {
          url: "/_next/static/media/e967e3e11e121e1e-s.woff2",
          revision: "4465bb12f10d6f67ba3ff5e91a04741b",
        },
        {
          url: "/_next/static/media/eafabf029ad39a43-s.p.woff2",
          revision: "43751174b6b810eb169101a20d8c26f8",
        },
        {
          url: "/_next/static/media/f10b8e9d91f3edcb-s.woff2",
          revision: "63af7d5e18e585fad8d0220e5d551da1",
        },
        {
          url: "/_next/static/media/fd4760995a87828b-s.woff2",
          revision: "837720d60e3d2c412b7959076ded962c",
        },
        {
          url: "/_next/static/media/fe0777f1195381cb-s.woff2",
          revision: "f2a04185547c36abfa589651236a9849",
        },
        { url: "/beasiswa.jpg", revision: "532e6489693b52b2b94a6fb3aeee7b49" },
        { url: "/blur.jpg", revision: "1ff4236622b27fb1242c128432834ce6" },
        { url: "/course/1.png", revision: "7098e333465f79c3e8837c7c3cb71aaa" },
        { url: "/course/2.png", revision: "e709f5f89ac82271773de9433ab5fe56" },
        { url: "/course/3.png", revision: "a32283917158d6a55a0ffbab36919c7e" },
        { url: "/course/4.png", revision: "dd7658d58dc096815598b7eff02a255f" },
        {
          url: "/default-avatar.png",
          revision: "14128e69a0b12653d8fa776c37e0b2ac",
        },
        { url: "/favicon.ico", revision: "41a9bc1b92a111436fdc9a8cb865b256" },
        {
          url: "/hmm-vstock/bp-black-transparent-.png",
          revision: "79396127fd39e366f1d269ef9f82ee29",
        },
        {
          url: "/hmm-vstock/bp-black-transparent.png",
          revision: "c338744b0bc123d8de27abb139da6610",
        },
        {
          url: "/hmm-vstock/bp-nonstransparent.png",
          revision: "a833fcaaf669d458ee0916be9f28d8c9",
        },
        {
          url: "/hmm-vstock/bp-pi-nontransparent.png",
          revision: "e328d7064675b190aa8b0f2a561e3613",
        },
        {
          url: "/hmm-vstock/bp-white-transparent-.png",
          revision: "bc53e22ebf116d2c616afdb4355d0abc",
        },
        {
          url: "/hmm-vstock/bp-white-transparent.png",
          revision: "2a6cc4f2ed11e517829c529613e7931e",
        },
        {
          url: "/hmm-vstock/bp.ai",
          revision: "99ba17e3b2b7eb2a6123f7235703eeaa",
        },
        {
          url: "/hmm-vstock/itb.png",
          revision: "c3db4793ecf0069869d8d9d5fc1d75f3",
        },
        {
          url: "/hmm-vstock/logo.png",
          revision: "e0b27c9c59f13a30706e5fd737140500",
        },
        {
          url: "/hmm-vstock/m-hmm-landscpae.jpg",
          revision: "d2d40a77f2665baa6fa07f66186e9823",
        },
        {
          url: "/hmm-vstock/m-hmm-potrait.jpg",
          revision: "6d6c9f9f6cfe32233dd790fad2e8d3bc",
        },
        {
          url: "/hmm-vstock/m.png",
          revision: "35c0d0ab08231429aedfac984cff82c7",
        },
        {
          url: "/hmm-vstock/radio-mesin-black.png",
          revision: "3bd4984c38d7f9b75dd68e9416e553b0",
        },
        {
          url: "/hmm-vstock/radio-mesin-red-black.png",
          revision: "278ab98b1c451077e79f8d423042ce3a",
        },
        {
          url: "/hmm-vstock/radio-mesin-white-red.png",
          revision: "6780c941ce616c31f8f4f6160f217b28",
        },
        {
          url: "/hmm-vstock/radio-mesin-white.png",
          revision: "b1a59ff9d9a36433456e21a04e3b333f",
        },
        {
          url: "/icons/icon-192x192.png",
          revision: "9df49e71b614b665cd481c4d12dcc5f2",
        },
        {
          url: "/icons/icon-512x512.png",
          revision: "074e0c152a411e4cc6455b4bc87bdc37",
        },
        {
          url: "/images/berita.png",
          revision: "4d47a6fbabf78152b3acc9ee5715ef48",
        },
        {
          url: "/images/circle-user.svg",
          revision: "c132a14d73ac4e2e533fd0aa898294bd",
        },
        {
          url: "/images/logo.png",
          revision: "b22e6b8fc696fbbf8cf7f881742e7b46",
        },
        {
          url: "/images/mesin.png",
          revision: "7098e333465f79c3e8837c7c3cb71aaa",
        },
        {
          url: "/images/pengukuran.png",
          revision: "e709f5f89ac82271773de9433ab5fe56",
        },
        {
          url: "/images/pipe_system.png",
          revision: "a32283917158d6a55a0ffbab36919c7e",
        },
        {
          url: "/images/printer.png",
          revision: "dd7658d58dc096815598b7eff02a255f",
        },
        {
          url: "/images/store.png",
          revision: "1b993cc9ccbf3849dcb7e2dc678cd517",
        },
        { url: "/manifest.json", revision: "c2d61f4cf980977b4e1be0b286d771a9" },
        {
          url: "/worker/index.js",
          revision: "d5c1d86684493bc774bcbb0a2eb5d7ba",
        },
        {
          url: "/worker/workbox-9210571b.js",
          revision: "0a6a31458832732a30097ba784654a09",
        },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "images",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/static\/.*/i,
      new e.CacheFirst({
        cacheName: "next-static",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js|css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-resources",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ));
});
