#ifndef INCLUDED_COMBO_TIME_H
#define INCLUDED_COMBO_TIME_H

#include <combo/types.h>

#define CLOCK_TIME(hr, min) ((s32)(((hr) * 60 + (min)) * (f32)0x10000 / (24 * 60) + 0.5f))

#if defined(GAME_OOT)
# define IS_DAY  (gSaveContext.save.isNight == 0)
# define IS_NIGHT (gSaveContext.save.isNight == 1)
#endif

typedef struct PlayState PlayState;

u32     Time_Game2Linear(u8 day, u16 time);
void    Time_Linear2Game(u8* day, u16* time, u32 linear);
u32     Time_LinearMoonCrash(void);
u32     Time_LinearNewCycle(void);
int     Time_IsMoonCrashLinear(u32 time);
int     Time_IsMoonCrash(u8 day, u16 time);
u32     Time_FromHalfDay(u8 halfDays);

#if defined(GAME_OOT)
void Time_Set(u16 time);
void Time_SwapDayNight(void);
#endif

#endif
