def now = 1700000000L
assert AccessPolicy.permits([sub:'synthetic-user',exp:now+60,scope:'openid accounts:read'],'accounts:read',now)
assert !AccessPolicy.permits([sub:'u',exp:now,scope:'accounts:read'],'accounts:read',now)
assert !AccessPolicy.permits([sub:'u',exp:now+1,scope:'accounts:read:all'],'accounts:read',now)
assert !AccessPolicy.permits([sub:'',exp:now+1,scope:'accounts:read'],'accounts:read',now)
assert !AccessPolicy.permits([sub:'u',exp:'later',scope:'accounts:read'],'accounts:read',now)
assert !AccessPolicy.permits(null,'accounts:read',now)
println '6 access-policy checks passed'
