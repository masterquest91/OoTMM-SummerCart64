#include <combo.h>

void ObjGrass_GetXflag(Xflag* xflag, Actor_ObjGrass_PackBush* bush);

void ObjGrassCarry_SpawnDropsWrapper(Actor_ObjGrassCarry* this)
{
    Xflag xflag;

    if (comboConfig(CFG_MM_SHUFFLE_GRASS))
    {
        /* Extract the ID and build the xflag */
        ObjGrass_GetXflag(&xflag, this->bush);

        /* Check if the reward was already collected */
        if (!comboXflagsGet(&xflag))
        {
            DropCustomItem(gPlay, &this->base.position, &xflag);
            return;
        }
    }

    /* Run the default function */
    void (*ObjGrassCarry_SpawnDrops)(Vec3f*, u16, GameState_Play*);
    ObjGrassCarry_SpawnDrops = actorAddr(AC_OBJ_GRASS_CARRY, 0x809aaf9c);
    ObjGrassCarry_SpawnDrops(&this->base.position, this->drop, gPlay);
}
