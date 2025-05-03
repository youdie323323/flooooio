extern "2" fn @"0"() u16;

extern "2" fn @"1"() u16;

pub inline fn getScreenWidth() u16 {
    return @"0"();
}

pub inline fn getScreenHeight() u16 {
    return @"1"();
}