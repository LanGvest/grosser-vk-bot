const VkBot = require('node-vk-bot-api');
const api = require('node-vk-bot-api/lib/api');
const Markup = require('node-vk-bot-api/lib/markup');
const Session = require('node-vk-bot-api/lib/session');
const Scene = require('node-vk-bot-api/lib/scene');
const Stage = require('node-vk-bot-api/lib/stage');
const app = require('firebase/app');
require('firebase/database');

const token = 'ac9c63f743c3517e0ff6f250cde0d67734cb662730f01d3840b37dc72b2a45ae3d962b15a6c51afc4223a';
const config = JSON.parse('{"apiKey":"AIzaSyAEechxvCFi_4G24P7418pgksPfVhRU1uY","authDomain":"com-grosser-sc.firebaseapp.com","databaseURL":"https://com-grosser-sc.firebaseio.com","projectId":"com-grosser-sc","storageBucket":"com-grosser-sc.appspot.com","messagingSenderId":"274728286603","appId":"1:274728286603:web:f405261fd3751d7f97578e","measurementId":"G-NE4RQ0DQ4Y"}');

const bot = new VkBot(token);
const firebase = app.initializeApp(config);
const FBD = firebase.database();

function ucFirst(str) {
	if (!str) return str;
	return str[0].toUpperCase() + str.slice(1);
}

function replaceAll(text, find, to) {
    let t = text;
    let isOk = true;
    while (isOk) {
        t = t.replace(find, to);
        if (!t.includes(find)) {
            isOk = false;
        }
    }
    return t;
}

const session = new Session();
bot.use(session.middleware());

const regKey = new Scene("regKey",
	(ctx) => {
		ctx.scene.next();
		ctx.reply(`Здравствуйте, [id${ctx.session.user_id}|${ctx.session.user_name}]! Перед тем как мы начнём процедуру регистрации нового ключа, хотим обратить Ваше внимание на то, что все заявки рассматриваются администрацией Großer. Это значит, что администратор в правеве как принять Вашу заявку, так и отклонить её.\n\nДля регистрации нового ключа от Вас понадобятся некоторые персональные данные, и от их правдоподобности будет зависить решение администратора.\n\nВы готовы продолжить?`, null, Markup.keyboard([
			"Да", "Нет"
		]).inline());
	},
	(ctx) => {
		if (ctx.session.repeat) {
			ctx.session.repeat = false;
			ctx.scene.next();
			ctx.reply("Имя указано некорректно. Пожалуйста, повторите попытку.");
		} else {
			if (ctx.session.restart) {
				ctx.session.restart = false;
				ctx.scene.next();
				ctx.reply(`Вас зовут ${ctx.session.user_name}? Если нет, напишите самостоятельно.`, null, Markup.keyboard([
					"Да"
				]).inline());
			} else {
				if (/^да\.?$/i.test(ctx.message.text)) {
					ctx.scene.next();
					ctx.reply(`Вас зовут ${ctx.session.user_name}? Если нет, напишите самостоятельно.`, null, Markup.keyboard([
						"Да"
					]).inline());
				} else {
					ctx.scene.leave();
					console.log(202, `[BOT] ${ctx.session.user_name} ${ctx.session.user_surname} отменил(а) регистрацию нового ключа.`);
					ctx.reply("Вы отменили регистрацию нового ключа.");
				}
			}
		}
	},
	(ctx) => {
		if (ctx.session.repeat) {
			ctx.session.repeat = false;
			ctx.scene.next();
			ctx.reply("Фамилия указана некорректно. Пожалуйста, повторите попытку.");
		} else {
			if (/^да\.?$/i.test(ctx.message.text)) {
				ctx.session.key_name = ctx.session.user_name;
				ctx.scene.next()
				ctx.reply(`Ваша фамилия ${ctx.session.user_surname}? Если нет, напишите самостоятельно.`, null, Markup.keyboard([
					"Да"
				]).inline());
			} else {
				let msg = ctx.message.text.trim();
				if (/^([А-я]{1}[а-яё]{1,23}|[A-z]{1}[a-z]{1,23})$/.test(msg)) {
					ctx.session.key_name = ucFirst(msg);
					ctx.scene.next();
					ctx.reply(`Ваша фамилия ${ctx.session.user_surname}? Если нет, напишите самостоятельно.`, null, Markup.keyboard([
						"Да"
					]).inline());
				} else {
					ctx.session.repeat = true;
					ctx.scene.enter("regKey", ctx.scene.step - 1);
				}
			}
		}
	},
	(ctx) => {
		if (ctx.session.repeat) {
			ctx.session.repeat = false;
			ctx.scene.next();
			ctx.reply("Дата рождения указана некорректно. Пожалуйста, повторите попытку.");
		} else {
			if (/^да\.?$/i.test(ctx.message.text)) {
				ctx.session.key_surname = ctx.session.user_surname;
				ctx.scene.next()
				let bdateArr = ctx.session.user_bdate.split(".");
				if (bdateArr[0] === "00" || bdateArr[1] === "00" || bdateArr[2] === "0000") {
					ctx.reply("Укажите свою дату рождения (в формате 00.00.0000).");
				} else {
					ctx.reply(`Вы родились ${ctx.session.user_bdate}? Если нет, напишите самостоятельно (в формате 00.00.0000).`, null, Markup.keyboard([
						"Да"
					]).inline());
				}
			} else {
				let msg = ctx.message.text.trim();
				if (/^([А-я]{1}[а-яё]{1,23}|[A-z]{1}[a-z]{1,23})$/.test(msg)) {
					ctx.session.key_surname = ucFirst(msg);
					ctx.scene.next();
					let bdateArr = ctx.session.user_bdate.split(".");
					if (bdateArr[0] === "00" || bdateArr[1] === "00" || bdateArr[2] === "0000") {
						ctx.reply("Укажите свою дату рождения (в формате 00.00.0000).");
					} else {
						ctx.reply(`Вы родились ${ctx.session.user_bdate}? Если нет, напишите самостоятельно (в формате 00.00.0000).`, null, Markup.keyboard([
							"Да"
						]).inline());
					}
				} else {
					ctx.session.repeat = true;
					ctx.scene.enter("regKey", ctx.scene.step - 1);
				}
			}
		}
	},
	(ctx) => {
		if (ctx.session.repeat) {
			ctx.session.repeat = false;
			ctx.scene.next();
			ctx.reply("Название страны указано некорректно. Пожалуйста, повторите попытку.");
		} else {
			if (/^да\.?$/i.test(ctx.message.text)) {
				ctx.session.key_bdate = ctx.session.user_bdate;
				ctx.scene.next()
				ctx.reply(`Ваша страна ${ctx.session.user_country}? Если нет, напишите самостоятельно.`, null, Markup.keyboard([
					"Да"
				]).inline());
			} else {
				let msg = ctx.message.text.trim();
				if (/^\d{2}\.\d{2}\.\d{4}$/.test(msg)) {
					let bdateArr = msg.split(".");
					if ((parseInt(bdateArr[0], 10) >= 1 && parseInt(bdateArr[0], 10) <= 31) && (parseInt(bdateArr[1], 10) >= 1 && parseInt(bdateArr[1], 10) <= 12) && (parseInt(bdateArr[2], 10) >= 1940 && parseInt(bdateArr[2], 10) <= 2017)) {
						ctx.session.key_bdate = msg;
						ctx.scene.next();
						ctx.reply(`Ваша страна ${ctx.session.user_country}? Если нет, напишите самостоятельно.`, null, Markup.keyboard([
							"Да"
						]).inline());
					} else {
						ctx.session.repeat = true;
						ctx.scene.enter("regKey", ctx.scene.step - 1);
					}
				} else {
					ctx.session.repeat = true;
					ctx.scene.enter("regKey", ctx.scene.step - 1);
				}
			}
		}
	},
	(ctx) => {
		if (ctx.session.repeat) {
			ctx.session.repeat = false;
			ctx.scene.next();
			ctx.reply(`Комментарий слишком длинный (${ctx.session.comment_lenght} символов из 200). Пожалуйста, повторите попытку.`, null, Markup.keyboard([
				"Пропустить"
			]).inline());
		} else {
			if (/^да\.?$/i.test(ctx.message.text)) {
				ctx.session.key_country = ctx.session.user_country;
				ctx.scene.next()
				ctx.reply("Вы можете оставить личный комментарий администратору, который будет рассматривать Вашу заявку (не более 200 символов).", null, Markup.keyboard([
					"Пропустить"
				]).inline());
			} else {
				let msg = ctx.message.text.trim();
				if (/^([А-я]{1}[а-яё]{1,23}|[A-z]{1}[a-z]{1,23})$/.test(msg)) {
					ctx.session.key_country = ucFirst(msg);
					ctx.scene.next();
					ctx.reply("Вы можете оставить личный комментарий администратору, который будет рассматривать Вашу заявку (не более 200 символов).", null, Markup.keyboard([
						"Пропустить"
					]).inline());
				} else {
					ctx.session.repeat = true;
					ctx.scene.enter("regKey", ctx.scene.step - 1);
				}
			}
		}
	},
	(ctx) => {
		if (/^пропустить\.?$/i.test(ctx.message.text)) {
			ctx.session.comment = "";
			ctx.session.key_comment = null;
			ctx.scene.next()
			ctx.reply(`Отлично! Осталось только проверить заполненные данные.\n\nИмя: ${ctx.session.key_name}\nФамилия: ${ctx.session.key_surname}\nДата рождения: ${ctx.session.key_bdate}\nСтрана: ${ctx.session.key_country}${ctx.session.comment}\n\nВы можете отправить эту заявку на рассмотрение или повторить попытку, если заметили, что допустили ошибку.`, null, Markup.keyboard([
				"Отправить", "Повторить", "Отмена"
			], {columns: 1}).inline());
		} else {
			let msg = ctx.message.text.trim().replace(/\n/g, " ");
			msg = replaceAll(msg, "  ", " ");
			if (msg.length <= 200) {
				ctx.session.comment = "\n\nКомментарий: " + ucFirst(msg);
				ctx.session.key_comment = ucFirst(msg);
				ctx.scene.next();
				ctx.reply(`Отлично! Осталось только проверить заполненные данные.\n\nИмя: ${ctx.session.key_name}\nФамилия: ${ctx.session.key_surname}\nДата рождения: ${ctx.session.key_bdate}\nСтрана: ${ctx.session.key_country}${ctx.session.comment}\n\nВы можете отправить эту заявку на рассмотрение или повторить попытку, если заметили, что допустили ошибку.`, null, Markup.keyboard([
					"Отправить", "Повторить", "Отмена"
				], {columns: 1}).inline());
			} else {
				ctx.session.repeat = true;
				ctx.session.comment_lenght = msg.length;
				ctx.scene.enter("regKey", ctx.scene.step - 1);
			}
		}
	},
	(ctx) => {
		switch (ctx.message.text) {
			case "Отправить": {
				FBD.ref("system/admins").once("value").then(function(fbd_snap) {
					let admins = fbd_snap.val().split(",");
					let bdateArr = ctx.session.key_bdate.split(".");
					for (var i = 0; i < 3; i++) bdateArr[i] = Number(bdateArr[i]);
					bdateArr[2] = bdateArr[2] - 2000;
					FBD.ref(`users/requests/vk${ctx.session.user_id}`).set({
						name: ctx.session.key_name,
						surname: ctx.session.key_surname,
						bdate: bdateArr.join("."),
						country: ctx.session.key_country,
						comment: ctx.session.key_comment
					}).then(() => {
						bot.sendMessage(admins, `Внимание администрации Großer! На столе новая заявка.\n\n[id${ctx.session.user_id}|${ctx.session.user_name}] хочет получить регистрационный ключ.\n\nID: ${ctx.session.user_id}\nИмя: ${ctx.session.key_name}\nФамилия: ${ctx.session.key_surname}\nДата рождения: ${ctx.session.key_bdate}\nСтрана: ${ctx.session.key_country}${ctx.session.comment}\n\nВы можете ответить на заявку в коммандном центре Großer: https://dev.grosser.of.by/requests?id=vk${ctx.session.user_id}.`);
					})
				})
				ctx.scene.leave();
				console.log(202, `[BOT] ${ctx.session.user_name} ${ctx.session.user_surname} успешно ЗАПРОСИЛ(А) регистрационный ключа.`);
				ctx.reply("Готово! Ваша заявка была успешно отправлена, и вскоре её рассмотрит администрация Großer. Как только администратор примит или отклонит её, Вы сразу же получите уведомление.");
				break;
			}
			case "Повторить": {
				ctx.session.restart = true;
				ctx.scene.enter("regKey", 1);
				break;
			}
			default: {
				ctx.scene.leave();
				console.log(202, `[BOT] ${ctx.session.user_name} ${ctx.session.user_surname} отменил(а) регистрацию нового ключа.`);
				ctx.reply("Вы отменили регистрацию нового ключа.");
			}
		}
	}
)

const stage = new Stage(regKey);
bot.use(stage.middleware());

bot.command(/^начать\.?$/i, (ctx) => {
	ctx.reply('Чем можем помочь?', null, Markup.keyboard([
		[Markup.button('Получить ключ', 'primary'), Markup.button('Запросить ключ', 'default')]
	]));
});

bot.command(/^получить ключ\.?$/i, (ctx) => {
	let user_id = ctx.message.from_id;
	api("users.get", {
		user_ids: user_id,
		access_token: token,
	}).then(function(vk_snap) {
		let user_name = vk_snap.response[0].first_name;
		let user_surname = vk_snap.response[0].last_name;
		FBD.ref("users/keys").orderByChild("surname").equalTo(user_surname).once("value").then(snap => {
            let keys = [];
            snap.forEach(item => {
                if(item.val().name === user_name) keys.push(item.key);
            })
            if(keys.length === 1) {
            	console.log(202, `[BOT] ${user_name} ${user_surname} получил(а) свой регистрационный ключ.`);
                ctx.reply(`Здравствуйте, [id${user_id}|${user_name}]! Ваш регистрационный ключ: ${keys[0]}.\n\nОбращаем Ваше внимание на то, что данная информация является строго конфиденциальной, поскольку регистрационный ключ необходим для создания нового аккаунта в системе Großer, и после его использования будет признан недействительным.\n\nПрямая ссылка: https://grosser.of.by/checkin?key=${keys[0].toLowerCase()}.\n\nС уважением, [public193609910|администрация Großer].`);
            } else {
                ctx.reply(`Здравствуйте, [id${user_id}|${user_name}]! На Ваше имя ещё не зарегистрирован ключ, или Вы уже использовали его.\n\nВы можете оставить заявку на получение регистрационного ключа, запросив его.\n\nС уважением, [public193609910|администрация Großer].`);
            }
        })
	})
})

bot.command(/^запросить ключ\.?$/i, (ctx) => {
	let user_id = ctx.message.from_id;
	api("users.get", {
		user_ids: user_id,
		fields: "country, bdate",
		access_token: token,
	}).then(function(vk_snap) {
		let user_name = vk_snap.response[0].first_name;
		let user_surname = vk_snap.response[0].last_name;
		FBD.ref("users/keys").orderByChild("surname").equalTo(user_surname).once("value").then(snap => {
			let keys = [];
			snap.forEach(item => {
				if(item.val().name === user_name) keys.push(item.key);
			})
			if(keys.length === 1) {
				ctx.reply(`Здравствуйте, [id${user_id}|${user_name}]! На Ваше имя уже зарегистрирован ключ, и Вы можете получить его.\n\nС уважением, [public193609910|администрация Großer].`);
			} else {
				FBD.ref(`users/requests/vk${user_id}`).once("value").then(function(fbd_snap_id) {
					if (fbd_snap_id.val()) {
						ctx.reply(`Здравствуйте, [id${user_id}|${user_name}]! Ваша заявка рассматривается. Как только администратор примит или отклонит её, Вы сразу же получите уведомление.\n\nС уважением, [public193609910|администрация Großer].`);
					} else {
						ctx.session.user_id = user_id;
						ctx.session.user_name = user_name;
						ctx.session.user_surname = user_surname;
						if (vk_snap.response[0].bdate) {
							let bdateArr = vk_snap.response[0].bdate.split(".");
							for (var i = 0; i < 2; i++) {
								if (bdateArr[i].length === 1) {
									bdateArr[i] = "0" + bdateArr[i];
								}
							}
							if (bdateArr.length === 2) bdateArr[2] = "0000";
							ctx.session.user_bdate = bdateArr.join(".");
						} else {
							ctx.session.user_bdate = "00.00.0000";
						}
						if (vk_snap.response[0].country) {
							ctx.session.user_country = vk_snap.response[0].country.title;
						} else {
							ctx.session.user_country = "Беларусь";
						}
						console.log(202, `[BOT] ${user_name} ${user_surname} начал(а) процедуру регистрации нового ключа.`);
						ctx.scene.enter("regKey");
					}
				})
			}
		})
	});
})

bot.startPolling();
