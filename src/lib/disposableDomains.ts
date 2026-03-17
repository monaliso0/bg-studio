/**
 * Blocklist de domínios de email descartáveis conhecidos.
 * Atualizar conforme necessário quando novos provedores surgirem.
 */
export const DISPOSABLE_DOMAINS = new Set([
  // Mailinator family
  "mailinator.com", "mailinator2.com", "mailinator.net",
  "suremail.info", "spamhereplease.com", "spamherelots.com",
  "thisisnotmyrealemail.com", "notmyrealemail.com",

  // 10 Minute Mail
  "10minutemail.com", "10minutemail.net", "10minutemail.org",
  "10minutemail.de", "10minutemail.co.uk", "10minutemail.it",
  "10minutemail.be", "10minutemail.cf", "10minutemail.ga",
  "10minutemail.gq", "10minutemail.ml", "10minutemail.us",

  // Temp Mail
  "temp-mail.org", "tempmail.com", "tempmail.net",
  "tempmail.io", "temp-mail.ru", "temp-mail.io",
  "tempr.email", "tempinbox.com", "tempinbox.co.uk",

  // Guerrilla Mail
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.biz", "guerrillamail.de", "guerrillamail.info",
  "guerrillamailblock.com", "sharklasers.com", "spam4.me",
  "grr.la", "jourrapide.com", "antichef.com", "antichef.net",
  "discimail.com", "spamevader.com",

  // Yop Mail
  "yopmail.com", "yopmail.fr", "yopmail.net",
  "cool.fr.nf", "jetable.fr.nf", "nospam.ze.tc",
  "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr",
  "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf",
  "monmail.fr.nf", "yopmail.pp.ua",

  // Trash Mail
  "trashmail.com", "trashmail.me", "trashmail.net",
  "trashmail.at", "trashmail.io", "trashmail.org",
  "trashmail.xyz", "trashmailer.com", "trashmail.app",

  // Spam / Throwaway
  "spamfree24.org", "spamgourmet.com", "spamgourmet.net",
  "spamgourmet.org", "spamoff.de", "spamgob.com",
  "spammotel.com", "spaml.com", "spaml.de",
  "spaml.net", "spam.la", "spam.su", "anti-spam.hu",

  // Maildrop / Throw-away
  "maildrop.cc", "mailnull.com", "mailnesia.com",
  "mailme.ir", "mailme.lv", "mailme24.com",
  "mailforspam.com", "mail-filter.com", "mail-temporaire.com",
  "mail-temporaire.fr", "mailbucket.org",

  // Disposable / One-use
  "dispostable.com", "discard.email", "discardmail.com",
  "discardmail.de", "filzmail.com", "filzmail.org",
  "fakeinbox.com", "fake-box.com", "fakemail.net",
  "fakemail.fr", "fakemailgenerator.com",

  // Throwam / Short-lived
  "throwam.com", "throwam.net", "throwaway.email",
  "throwaways.net", "throwmail.me",

  // Others commonly used
  "meltmail.com", "anonymbox.com", "ephemail.net",
  "klzlk.com", "inboxbear.com", "e4ward.com",
  "getairmail.com", "wegwerfmail.de", "wegwerfmail.net",
  "wegwerfmail.org", "mvrht.com", "crazymailing.com",
  "dispostable.com", "kurzepost.de", "objectmail.com",
  "proxymail.eu", "rcpt.at", "slo.net",
  "sofimail.com", "sogetthis.com", "temporaryinbox.com",
  "thanksnospam.info", "thecloudindex.com", "thisisnotmyrealemail.com",
  "viditag.com", "webm4il.info", "zoemail.net",
  "mt2015.com", "mt2016.com", "mtmdev.com",
  "nwldx.com", "owlpic.com", "lkgn.se",
  "uroid.com", "vomoto.com", "binkmail.com",
  "bobmail.info", "chammy.info", "devnullmail.com",
  "letthemeatspam.com", "mailinater.com", "mailismagic.com",
  "nospamfor.us", "obobbo.com", "teleworm.com",
  "teleworm.us", "imgof.com", "imgv.de",
  "inoutmail.de", "inoutmail.eu", "inoutmail.info",
  "inoutmail.net", "throwam.com", "thrma.com",

  // Guerrilla-like
  "byom.de", "correo.blogos.net", "incognitomail.com",
  "incognitomail.net", "incognitomail.org", "luxusmail.org",
  "mailexpire.com", "mailfreeonline.com", "mailguard.me",
  "mailimate.com", "mailin8r.com", "mailinater.com",

  // Misc
  "33mail.com", "amilegit.com", "amiri.net",
  "casualdx.com", "centermail.com", "centermail.net",
  "chogmail.com", "cool.fr.nf", "crossroadsmail.com",
  "dingbone.com", "dontreg.com", "dontsendmespam.de",
  "dump-email.info", "dumpandfuck.com", "dumpmail.de",
  "dumpyemail.com", "fastacura.com", "fastchevy.com",
  "fastem.com", "fastemail.us", "fastemailer.com",
  "fastest.cc", "fastimap.com", "fastmazda.com",
  "fastmitsubishi.com", "fastnissan.com", "fastsubaru.com",
  "fastsuzuki.com", "fasttoyota.com", "fastyamaha.com",
  "no-spam.ws", "nobulk.com", "noclickemail.com",
  "nogmailspam.info", "nospam4.us", "nospamthanks.info",
  "notmailinator.com", "notsharingmy.info",
  "oneoffemail.com", "onewaymail.com", "online.ms",
  "oopi.org", "opayq.com", "ordinaryamerican.net",
]);
