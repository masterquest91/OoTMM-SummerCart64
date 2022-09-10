require 'set'

module Combo::Logic
  module Util
    def self.make_multihash_set(data)
      make_multihash(Set, data)
    end

    def self.make_multihash_array(data)
      make_multihash(Array, data)
    end

    def self.make_multihash(klass, data)
      h = {}
      data.each do |pair|
        k = pair[0]
        v = pair[1]
        h[k] ||= klass.new
        h[k] << v
      end
      h
    end

    def self.game_id(game, id)
      [game.to_s.upcase, id].join('_').to_sym
    end

    def self.junk_item?(x)
      %i[
        OOT_RECOVERY_HEART
        OOT_RUPEE_GREEN
        OOT_RUPEE_BLUE
        OOT_RUPEE_RED
        OOT_RUPEE_PURPLE
        OOT_BOMBS_5
        OOT_BOMBS_10
        MM_RECOVERY_HEART
        MM_RUPEE_GREEN
        MM_RUPEE_BLUE
        MM_RUPEE_RED
        MM_RUPEE_PURPLE
      ].include?(x)
    end

    def self.semi_junk_item?(x)
      %i[
        OOT_HEART_PIECE
        OOT_HEART_CONTAINER
        OOT_HEART_CONTAINER2
        OOT_RUPEE_HUGE
        MM_HEART_PIECE
        MM_HEART_CONTAINER
        MM_HEART_CONTAINER2
        MM_RUPEE_SILVER
        MM_RUPEE_GOLD
    ].include?(x)
    end

    def self.dungeon_item?(x)
      %i[
        OOT_MAP
        OOT_COMPASS
        MM_MAP
        MM_COMPASS
        MM_STRAY_FAIRY
      ].include?(x)
    end

    def self.goal_item?(x)
      %i[
        OOT_STONE_EMERALD
        OOT_STONE_RUBY
        OOT_STONE_SAPPHIRE
        OOT_MEDALLION_FOREST
        OOT_MEDALLION_FIRE
        OOT_MEDALLION_WATER
        OOT_MEDALLION_SPIRIT
        OOT_MEDALLION_SHADOW
        OOT_MEDALLION_LIGHT
        MM_REMAINS_ODOLWA
        MM_REMAINS_GOHT
        MM_REMAINS_GYORG
        MM_REMAINS_TWINMOLD
      ].include?(x)
    end

    def self.small_key?(x)
      %i[
        OOT_SMALL_KEY
        MM_SMALL_KEY
      ].include?(x)
    end

    def self.boss_key?(x)
      %i[
        OOT_BOSS_KEY
        MM_BOSS_KEY
      ].include?(x)
    end

    def self.important_item?(x)
      !junk_item?(x) && !semi_junk_item?(x) && !dungeon_item?(x) && !small_key?(x) && !boss_key?(x)
    end
  end
end
