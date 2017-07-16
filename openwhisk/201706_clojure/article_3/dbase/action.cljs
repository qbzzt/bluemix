(ns action.core)

(def cloudant-fun (js/require "cloudant"))

(def cloudant (cloudant-fun "url goes here"))

(def mydb (.use (aget cloudant "db") "openwhisk_inventory"))



; Process an action with its parameters and the existing database
; return the result of the action
(defn processDB [action dbase data]
  (case action
    "getAll" {"data" dbase}

    "getAvailable" {"data" (into {} (filter #(> (nth % 1) 0) dbase))}

    "processCorrection" (do
      (def dbaseNew (into dbase data))
      {"data" dbaseNew}
    )

    "processPurchase" (do
      (def dbaseNew (merge-with #(- %1 %2) dbase data))
      {"data" dbaseNew}
    )

    "processReorder" (do
      (def dbaseNew (merge-with #(+ (- %1 0) (- %2 0)) dbase data))
      {"data" dbaseNew}
    )

    {"error" "Unknown action"}
  )   ;  end of case
)   ; end of processDB



(defn cljsMain [params] (
    let [
      cljParams (js->clj params)
      action (get cljParams "action")
      data (get cljParams "data")
      updateNeeded (or (= action "processReorder")
                       (= action "processPurchase")
                       (= action "processCorrection"))
    ]

    ; Because promise-resolve is here, it can reference
    ; action
    (defn promise-resolve [resolve param] (let
      [
        dbaseJS (aget param "dbase")
        dbaseOld (js->clj dbaseJS)
        result (processDB action dbaseOld data)
        rev (aget param "_rev")
      ]
        (if updateNeeded
          (.insert mydb (clj->js {"dbase" (get result "data"),
                                  "_id" "dbase",
                                  "_rev" rev})
            #(do (prn result) (prn (get result "data")) (resolve (clj->js result)))
          )
          (resolve (clj->js result))
        )
      )   ; end of let
    )   ; end of defn promise-resolve


    (defn promise-func [resolve reject]
      (.get mydb "dbase" #(promise-resolve resolve %2))
    )

    (js/Promise. promise-func)
  )   ; end of let
)    ; end of cljsMain
