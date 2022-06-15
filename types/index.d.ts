declare module 'kurdish-nicknames' {
  export class KurdishNicknames {
    /**
     * Generate a name object or an array of name objects
     * @param gender of the request name, default is both
     * @param max_length the max length allowed for each first and last name
     * @param no_of_names The number of name objects to be generated
     * @return a name object is no_of_names=1 otherwise an array of name objects
     * */
    static generate(): ResultType

    static generate(
      gender: string,
      max_length: 1
    ): ResultType

    static generate(
      gender: string,
      max_length: number
    ): ResultType[]

    static generate(
      gender: string,
      max_length: 1,
      no_of_names: number
    ): ResultType

    static generate(
      gender?: string,
      max_length?: number,
      no_of_names?: number
    ): ResultType[]
  }

  type ResultType = {
    first_name: string,
    last_name: string,
    first_name_meaning: string,
    last_name_meaning: string,
    gender: string
  }
}
