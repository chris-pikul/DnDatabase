import { ClampInt, RandomFloat } from './utils/math';
import { IsPlainObject } from './utils/json-object';

/**
 * Describes the value of something, or a general ammount of monetary
 * treasure.
 */
export interface ICurrency {
  copper    ?: number;
  silver    ?: number;
  electrum  ?: number;
  gold      ?: number;
  platinum  ?: number;
};

/**
 * Describes an amount of money, or currency. Breaks the values down between
 * the denominations copper, silver, electrum, gold, and platinum.
 */
export default class Currency implements ICurrency {
  /**
   * Generates a new Currency object with a random gold value applied, and
   * balanced.
   * 
   * @param min Minimum gold value, inclusive
   * @param max Maximum gold value, inclusive
   * @returns New Currency object representing the balanced value
   */
  static random = (min:number, max:number):Currency => {
    const goldValue = RandomFloat(min, max);
    return new Currency(goldValue);
  }

  /**
   * Reduces an incoming value by the divisor supplied.
   * Returns an array of 2 integers.
   *  1. The remaining value after division in the current denomination.
   *  2. The amount of the next denomination that was exchanged.
   * 
   * Used for calculating exchanges up to the next denomination.
   * 
   * @param value Input value to reduce
   * @param div The divisor to the next denomination (default 10)
   * @returns [ remainder, next ]
   */
  static reduce = (value:number, div:number=10):Array<number> => ([value % div, Math.floor(value / div)]);

  copper    ?: number;
  silver    ?: number;
  electrum  ?: number;
  gold      ?: number;
  platinum  ?: number;

  /**
   * Constructs a new Currency object.
   * 
   * The first parameter `props` can be supplied with either a Currency object,
   * a JSON object resembling a Currency object, or a number.
   * 
   * If an object is provided, the properties will be copied into the new object,
   * essentially a hard-copy.
   * 
   * If a number is provided, it is treated as a Gold Value and the needed 
   * denominations are calculated using it. The object created will have this
   * value broken down into all the denominations using Currency.fromGold().
   * With this option, the remaining properties determine how this gold value
   * is handled. As in, should we calculate the platinum equivelents, or the
   * electrum values as well.
   * 
   * The resulting Currency object will only hold the properties needed and
   * will not assign empty denominations.
   * 
   * @param props Either an object, or a number
   * @param usePlatinum If a number was provided, whether to use platinum
   * @param useElectrum If a number was provided, whether to use electrum
   */
  constructor(props:any = undefined, usePlatinum:boolean = true, useElectrum:boolean = false) {
    
    // Check if any properties where supplied
    if(typeof props !== 'undefined' && props !== null) {
      if(props instanceof Currency || IsPlainObject(props)) {
        // If it's just a JSON type object, check for the props and copy.
        if(props.copper && typeof props.copper === 'number')
          this.copper = ClampInt(props.copper, 0);
        if(props.silver && typeof props.silver === 'number')
          this.silver = ClampInt(props.silver, 0);
        if(useElectrum && props.electrum && typeof props.electrum === 'number')
          this.electrum = ClampInt(props.electrum, 0);
        if(props.gold && typeof props.gold === 'number')
          this.gold = ClampInt(props.gold, 0);
        if(usePlatinum && props.platinum && typeof props.platinum === 'number')
          this.platinum = ClampInt(props.platinum, 0);
      } else if(typeof props === 'number') {
        this.fromGold(props, usePlatinum, useElectrum);
      } else {
        console.warn(`Attemnpting to instantiate AlignmentAxes with invalid property.`);
      }
    }

  }

  /**
   * Converts this value into a string for printing. Comes in the form of:
   * "[5CP 10SP 3EP 100GP 1PP]"
   * 
   * NOTE: Only uses the values present in this object, will not print 0
   * values.
   */
   toString = ():string => {
    let str = '';

    if(this.copper) str += ` ${this.copper}CP`;
    if(this.silver) str += ` ${this.silver}SP`;
    if(this.electrum) str += ` ${this.electrum}EP`;
    if(this.gold) str += ` ${this.gold}GP`;
    if(this.platinum) str += ` ${this.platinum}PP`;

    if(str.length === 0) return 'Zero';
    return `[${str.substr(1)}]`;
  }

  /**
   * Converts this object into a singular "Gold Value". This is done by
   * converting each denomination to it's GP equivelent.
   * 
   * The parameter `truncate` decides whether a whole integer is returned,
   * or a floating-point value (default).
   * 
   * @param truncate Whether to return an integer, or a floating point number
   * @returns Number relating to the gold value
   */
  toGold = (truncate:boolean = false):number => {
    let gp = this.gold || 0;

    if(this.platinum) gp += this.platinum * 10;
    if(this.electrum) gp += this.electrum * 0.5;
    if(this.silver) gp += this.silver * 0.1;
    if(this.copper) gp += this.copper * 0.01;

    if(truncate) return Math.floor(gp);
    return gp;
  };

  /**
   * Adds the given value to this object.
   * 
   * If `balanceAfter` is true, this object will have it's values exchanged
   * to balance the denominations using the default parameters (using platinum,
   * excluding electrum).
   * 
   * @param value Currency object, or Gold Value number
   * @param balanceAfter Whether to balance the currency after adding.
   */
  add = (value:(Currency|number), balanceAfter:boolean = false):void => {
    let obj = new Currency(value);

    if(obj.copper) this.copper = (this.copper || 0) + obj.copper;
    if(obj.silver) this.silver = (this.silver || 0) + obj.silver;
    if(obj.electrum) this.electrum = (this.electrum || 0) + obj.electrum;
    if(obj.gold) this.gold = (this.gold || 0) + obj.gold;
    if(obj.platinum) this.platinum = (this.platinum || 0) + obj.platinum;

    if(balanceAfter) this.balance();
  }

  /**
   * Subtracts the given value to this object.
   * 
   * If `balanceAfter` is true, this object will have it's values exchanged
   * to balance the denominations using the default parameters (using platinum,
   * excluding electrum).
   * 
   * @param value Currency object, or Gold Value number
   * @param balanceAfter Whether to balance the currency after subtracting.
   */
  subtract = (value:(Currency|number), balanceAfter:boolean = false):void => {
    let obj = new Currency(value);

    if(obj.copper) this.copper = (this.copper || 0) - obj.copper;
    if(obj.silver) this.silver = (this.silver || 0) - obj.silver;
    if(obj.electrum) this.electrum = (this.electrum || 0) - obj.electrum;
    if(obj.gold) this.gold = (this.gold || 0) - obj.gold;
    if(obj.platinum) this.platinum = (this.platinum || 0) - obj.platinum;

    if(balanceAfter) this.balance();
  }

  /**
   * Replaces all monetary values with their balanced values from the given gold
   * input. This breaks down and exchanges all the gold for each minimum value.
   * 
   * Examples:
   * ```
   *  assignFromGold(123) -> {
   *    copper: 0,
   *    silver: 0,
   *    gold: 3,
   *    platinum: 12,
   *  };
   * 
   *  assignFromGold(123.567, false, true) -> {
   *    copper: 6,
   *    silver: 0,
   *    electrum: 1,
   *    gold: 123,
   *  };
   * ```
   * 
   * @param gp Numerical (floating) gold value
   * @returns any remaining value not exchanged
   */
   fromGold = (gp:number, usePlatinum:boolean = true, useElectrum:boolean = false):number => {
    let cp=0, sp=0, ep=0, pp=0;
    let rem;

    // Start with platinum if we are using it
    if(usePlatinum) {
      pp = Math.floor(gp * 0.1);
      gp -= (pp * 10);
    }

    // Calculate the running remainder we will use for the rest of the
    // operations.
    rem = gp - Math.floor(gp);

    // Gold
    gp = Math.floor( gp - rem );

    // If we are using electrum, calculate that now.
    if(useElectrum) {
      ep = Math.floor(rem * 2);
      rem -= (ep * 0.5);
    }

    // Silver
    sp = Math.floor( rem * 10 );
    rem -= (sp * 0.1);

    // Copper
    cp = Math.floor( rem * 100 );
    rem -= (cp * 0.01);

    // Apply all the values if we have them
    if(cp) this.copper = cp;
    if(sp) this.silver = sp;
    if(ep) this.electrum = ep;
    if(gp) this.gold = gp;
    if(pp) this.platinum = pp;

    return rem;
  }

  /**
   * Attempts to balance the values by exchanging each value upwords
   * towards the highest next denomination.
   * 
   * If the `usePlatinum` switch is true (default), then gold will be reduced
   * as well up to the platinum value. If false, then it will stop at gold and
   * the existing platinum will be enlarged to it's gold value.
   * 
   * If the `useElectrum` switch is true, electrum will be used as well. If
   * false (default), then electrum will be enlarged to silver.
   * 
   * @param usePlatinum boolean whether to allow platinum values (default: true)
   * @param useElectrum boolean whether to allow electrum values (default: false)
   */
  balance = (usePlatinum:boolean = true, useElectrum:boolean = false):void => {
    let cp = this.copper || 0;
    let sp = this.silver || 0;
    let ep = this.electrum || 0;
    let gp = this.gold || 0;
    let pp = this.platinum || 0;

    // Work out the copper
    if(cp) {
      const [ rem, next ] = Currency.reduce(cp);
      cp = rem;
      sp += next;
    }

    // Work out the silver.
    // We need to know if we are using the electrum switch here.
    if(useElectrum) {
      {
        const [ rem, next ] = Currency.reduce(sp, 5);
        sp = rem;
        ep += next;
      }

      // Work out the electrum since we are here.
      {
        const [ rem, next ] = Currency.reduce(ep, 2);
        ep = rem;
        gp += next;
      }
    } else {
      // Enlarge any remaining electrum
      sp = ep * 5;
      ep = 0;

      // Work the silver -> gold
      const [ rem, next ] = Currency.reduce(sp);
      sp = rem;
      gp += next;
    }

    // Check how we are dealing with platinum
    if(usePlatinum) {
      const [ rem, next ] = Currency.reduce(gp, 10);
      gp = rem;
      pp = next;
    } else {
      // We are not using platinum, so we need to enlarge it.
      gp += pp * 10;
      pp = 0;
    }

    // Assign any values used, and remove any not used.
    if(cp) this.copper = cp
    else delete this.copper;

    if(sp) this.silver = sp;
    else delete this.silver;

    if(ep && useElectrum) this.electrum = ep;
    else delete this.electrum;

    if(gp) this.gold = gp;
    else delete this.gold;

    if(pp && usePlatinum) this.platinum = pp;
    else delete this.platinum;
  }
}
