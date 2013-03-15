shelby.config.dotTvNetworks = {
  userProfileViewCreatorIds : [
    '4d9b3486f6db24104e000001', // fredwilson
    '4fdee5f91c1cf4714200a605', // nerdfitness
    '4d7a882df6db246de0000001', // spinosa
    '4d7d154ff6db244f5e000001', // reece
    '51190f1db415cc77f308eb1c', // quilting
    '4dc0add6f6db246d8f000001', // henry
    '51214bf1b415cc1c5c004bb7', // food52
    '513f4963b415cc143a00ec85', // chipsahoy
    '4f32e49fad9f11053b00020a'  // iceberg901
  ],
  userProfileViewAbOverrideCreatorIds : [
    '4d7ac94af6db241b5d000002' // chris
  ],
  dotTvCuratorSpecialConfig : [
    {
      id : '513f4963b415cc143a00ec85', // chipsahoy
      customShareMessages : {
        email : 'Check this sweet video I found on ChipsAhoy.TV via Shelby.tv: <%= link %>',
        twitter : 'Do you have the #sweetestbracket? Check this sweet video I found on @ChipsAhoy TV <%= link %> via @Shelby'
      },
      bodyClass : 'shelby--chips-ahoy',
      buttonColor : 'button_chips-ahoy',
      showAppBanner : true,
      showDotTvNetworkBanner : false
    }
  ],
  dotTvRollSpecialConfig : [
    {
      id : '513f4964b415cc143a00ec8b', // chipsahoy.tv aka March Madness
      attribution : {
        authorAvatar : '//s3.amazonaws.com/shelby-gt-user-avatars/sq48x48/513f4963b415cc143a00ec85?1363269645000',
        authorName : 'Chips Ahoy!'
      },
      showAttribution : true,
      rollTitleOverride : 'The Sweetest Bracket'
    },
    {
      id : '513f8019b415cc3b3900000d', // #sweetestbracket
      attribution : {
        authorAvatar : '//s3.amazonaws.com/shelby-gt-user-avatars/sq48x48/51420e57b415cc7c7c064a1d?1363283581000',
        authorName : 'The videoverse'
      },
      showAttribution : true
    },
    {
      id : '50f6d51cb415cc7ebd000007', // #MarchMadness
      attribution : {
        authorAvatar : '//s3.amazonaws.com/shelby-gt-user-avatars/sq48x48/51420e57b415cc7c7c064a1d?1363283581000',
        authorName : 'The videoverse'
      },
      showAttribution : true
    }
  ]
};