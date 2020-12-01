const print = console.log;
const ln = () => process.stdout.write('\n');
print('Discord API Explorer - 서버 및 채널 조회');
process.stdout.write('불러오는 중... ');

const token = '계정 토큰', userid = '계정 ID';
const readline = require('readline');
const http = require('https');

function request(path) {
    return new Promise((resolve, reject) => {
        http.request({
            host: 'ptb.discord.com',
            path: '/api/v6' + path,
            headers: {
                "Authorization": token,
                "User-Agent": 'Mozilla/5.0 (Windows NT 6.1; rv:83.0) Firefox/83.0'
            }
        }, function(res) {
            try {
                var ret = '';

                res.on('data', function(chunk) {
                    ret += chunk;
                });

                res.on('end', function() {
					var msg; ret = JSON.parse(ret);
					
					if(msg = ret.message) reject(msg);
                    else resolve(ret);
                });
            } catch(e) {
                reject(e);
            }
        }).end();
    });
}

const perms = {
	'관리자': 8,
	'관리 내역 보기': 128,
	'서버 인사이트 보기': 524288,
	'서버 관리자': 32,
	'권한 관리자': 268435456,
	'채널 관리자': 16,
	'추방': 2,
	'차단': 4,
	'초대': 1,
	'자신의 별명 변경': 67108864,
	'별명 관리자': 134217728,
	'그림 문자 관리자': 1073741824,
	'웹후크 관리자': 536870912,
	'메시지 읽기 & 음성 채널 보기': 1024,
	'메시지 보내기': 2048,
	'음성 메시지 보내기': 4096,
	'메시지 관리자': 8192,
	'링크 전송': 16384,
	'화일 첨부': 32768,
	'이전 메시지 보기': 65536,
	'모두 핑하기': 131072,
	'외부 그림문자 사용': 262144,
	'반응': 64,
	'음성 채널 접속': 1048576,
	'말하기': 2097152,
	'카메라 & 화면 공유': 512,
	'사용자 마이크 음소거': 4194304,
	'사용자 스피커 음소거': 8388608,
	'사용자 이동': 16777216,
	'음성 감지 사용': 33554432,
	'우선 발언자': 256
};

var f;

function getRole(r, g) {
	return new Promise((resolve, reject) => {
		request('/guilds/' + g).then(guild => {
			for(role of guild.roles) {
				if(role.id == r) return resolve(role);
			}
		}).catch(msg => {
			reject('서버가 존재하지 않거나 참여중이지 않습니다.');
		});
	});
}

function getUser(u) {
	return new Promise((resolve, reject) => {
		request('/users/' + u + '/profile').then(user => {
			resolve(user.user);
		}).catch(msg => {
			reject('사용자를 찾을 수 없습니다.');
		});
	});
}

request('/users/' + userid + '/profile').then(res => {
	const username = res.user.username;
	print('완료!\n');
	
	(f = function() {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		
		rl.question(username + '> ', _cmd => {
			rl.close();
			
			const cmd = _cmd.replace(/\s{2,}/g, ' ').split(' ');
			
			
				switch(cmd[0].toLowerCase()) {
				case 'g':
				case 'guild':
					(function() {
						const guildid = cmd[1];
						if(!guildid) {
							print('서버 ID를 지정하지 않았거나 올바르지 않습니다.\n');
							f();
						} else
						
						request('/guilds/' + guildid).then(guild => {
							print('서버 이름: ' + guild.name);
							print('서버 ID:   ' + guild.id);
							print('국가:      ' + guild.region);
							ln();
							print('잠수 채널 ID:   ' + (guild.afk_channel_id || '없음'))
							print('잠수 대기 시간: ' + guild.afk_timeout);
							ln();
							
							f();
						}).catch(msg => {
							print('서버가 존재하지 않거나 참여중이지 않습니다.\n');
							f();
						});
					})();
					
					break;
				case 'rs':
				case 'roles':
					(function() {
						const guildid = cmd[1];
						if(!guildid) {
							print('서버 ID를 지정하지 않았거나 올바르지 않습니다.\n');
							f();
						} else 
						
						request('/guilds/' + guildid).then(guild => {
							for(role of guild.roles) {
								print('역할 이름: ' + role.name);
								print('역할 ID:   ' + role.id);
								ln();
								
								process.stdout.write('권한: ');
								for(perm in perms) {
									if((role.permissions & perms[perm]) == perms[perm])
										process.stdout.write(perm + ' / ');
								}
								print('\n');
								
								if(role.color) print('색: #' + role.color.toString(16).toUpperCase());
								ln();
								
								print('멤버 목록에서 분리: ' + (role.hoist ? '예' : '아니오'));
								print('핑 가능:            ' + (role.mentionable ? '예' : '아니오'));
								
								print('\n---------------------------------------------------------------------------\n');
							}
							
							f();
						}).catch(msg => {
							print('서버가 존재하지 않거나 참여중이지 않습니다.\n');
							f();
						});
					})();
					
					break;
				case 'c':
				case 'ch':
				case 'channels':
					(function() {
						const chid = cmd[1];
						if(!chid) {
							print('채널 ID를 지정하지 않았거나 올바르지 않습니다.\n');
							f();
						} else 
						
						request('/channels/' + chid).then(channel => {
							print('채널 이름:        ' + channel.name);
							print('채널 ID:          ' + channel.id);
							print('위치:             ' + channel.position);
							print('분류 ID:          ' + channel.parent_id);
							print('주제:             ' + channel.topic);
							print('후방주의:         ' + (channel.nsfw ? '예' : '아니오'));
							print('마지막 고정 시간: ' + (channel.last_pin_timestamp ? (new Date(channel.last_pin_timestamp).toString()) : '없음'));
							ln();
								
							print('마지막 메시지 ID: ' + channel.last_message_id);
							ln();
							
							var num = 0, r;
							
							// await 안(못) 쓰고 하니 무지 복잡하넹;;
							// 왜 하필 중요한 기능이 생긴 버전에서 액스피 지원을 끊어버렷! 8.0에서 끊지 6.0에서 끊어
							(r = function(poi) {
								// for(po of channel.permission_overwrites) {
								const po = channel.permission_overwrites[poi];
								if(!po) {
									ln(); f();
								}
								
								print('ACL #' + ++num + ' 대상 ID: ' + po.id);
								
								(po.type == 'role' ? getRole : getUser)(po.id, channel.guild_id).then(data => {
									print('ACL #' + num + ' 대상 이름: ' + (data.username || data.name));
									
									process.stdout.write('ACL #' + num + ' 허용 권한: ');
									for(perm in perms) {
										if((po.allow & perms[perm]) == perms[perm])
											process.stdout.write(perm + ' / ');
									}
									process.stdout.write('\n');
									
									
									process.stdout.write('ACL #' + num + ' 거부 권한: ');
									for(perm in perms) {
										if((po.deny & perms[perm]) == perms[perm])
											process.stdout.write(perm + ' / ');
									}
									print('\n');
									
									r(poi + 1);
								});
							})(0);
						}).catch(msg => {
							print('채널이 존재하지 않거나 참여중이지 않습니다.\n');
							f();
						});
					})();
					
					break;
				case 'h':
				case '?':
				case 'help':
					print('help\t guild\t channel\t roles');
					ln();
					f();
					
					break;
				default:
					print('명령 또는 파일이 틀립니다\n');
					f();
			}
		});
	})();
});
