//! Access basic DOM properties.
extern "2" fn @"0"() u16;

extern "2" fn @"1"() u16;

extern "2" fn @"2"() f32;

pub fn clientWidth() u16 {
    return @"0"();
}

pub fn clientHeight() u16 {
    return @"1"();
}

pub fn devicePixelRatio() f32 {
    return @"2"();
}